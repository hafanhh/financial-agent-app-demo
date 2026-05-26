import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../data')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'baked.db'))
db.pragma('journal_mode = WAL')

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Session {
  id: string
  persona: string
  location: string | null
  created_at: number
  updated_at: number
}

export interface Message {
  id: string
  session_id: string
  role: string
  content: string
  citations: string | null
  confidence: string | null
  message_type: string | null
  created_at: number
}

export interface WasteItem {
  sku: string
  estimatedUnits: number
  estimatedCostIDR: number
  confidence: 'high' | 'medium' | 'low'
  condition: 'waste' | 'possibly-sellable' | 'unclear'
  notes?: string
}

export interface WasteLog {
  id: string
  session_id: string | null
  location: string
  logged_at: number
  items: string
  total_cost_idr: number
  image_quality: string | null
  confirmed: number
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initDb(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      persona TEXT NOT NULL,
      location TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      citations TEXT,
      confidence TEXT,
      message_type TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS waste_logs (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      location TEXT NOT NULL,
      logged_at INTEGER NOT NULL,
      items TEXT NOT NULL,
      total_cost_idr INTEGER NOT NULL,
      image_quality TEXT,
      confirmed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS session_summaries (
      session_id TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      message_count_at_summary INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `)
  console.log('[db] SQLite initialized at', path.join(DATA_DIR, 'baked.db'))
}

// ── Session operations ────────────────────────────────────────────────────────

export function getOrCreateSession(
  id: string,
  persona: string,
  location?: string,
): Session {
  const now = Date.now()
  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined
  if (existing) {
    db.prepare('UPDATE sessions SET updated_at = ?, persona = ?, location = ? WHERE id = ?')
      .run(now, persona, location ?? null, id)
    return { ...existing, updated_at: now, persona, location: location ?? null }
  }
  const session: Session = { id, persona, location: location ?? null, created_at: now, updated_at: now }
  db.prepare('INSERT INTO sessions (id, persona, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, persona, location ?? null, now, now)
  return session
}

export function getSession(id: string): Session | undefined {
  return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Session | undefined
}

// ── Message operations ────────────────────────────────────────────────────────

export function saveMessage(msg: Omit<Message, 'created_at'>): void {
  db.prepare(
    `INSERT OR REPLACE INTO messages (id, session_id, role, content, citations, confidence, message_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    msg.id,
    msg.session_id,
    msg.role,
    msg.content,
    msg.citations ?? null,
    msg.confidence ?? null,
    msg.message_type ?? null,
    Date.now(),
  )
}

export function getMessages(sessionId: string, limit = 50): Message[] {
  return db
    .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?')
    .all(sessionId, limit) as Message[]
}

export function getRecentMessages(sessionId: string, n = 10): Message[] {
  const rows = db
    .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?')
    .all(sessionId, n) as Message[]
  return rows.reverse()
}

export function getMessageCount(sessionId: string): number {
  const row = db
    .prepare('SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?')
    .get(sessionId) as { cnt: number }
  return row.cnt
}

export function clearMessages(sessionId: string): void {
  db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId)
  db.prepare('DELETE FROM session_summaries WHERE session_id = ?').run(sessionId)
}

// ── Summary operations ────────────────────────────────────────────────────────

export function saveSummary(sessionId: string, summary: string, messageCount: number): void {
  db.prepare(
    `INSERT OR REPLACE INTO session_summaries (session_id, summary, message_count_at_summary, updated_at)
     VALUES (?, ?, ?, ?)`,
  ).run(sessionId, summary, messageCount, Date.now())
}

export function getSummary(sessionId: string): string | null {
  const row = db
    .prepare('SELECT summary FROM session_summaries WHERE session_id = ?')
    .get(sessionId) as { summary: string } | undefined
  return row?.summary ?? null
}

// ── Waste log operations ──────────────────────────────────────────────────────

export function saveWasteLog(log: Omit<WasteLog, 'confirmed'>): string {
  const id = log.id || `wl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  db.prepare(
    `INSERT INTO waste_logs (id, session_id, location, logged_at, items, total_cost_idr, image_quality, confirmed)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
  ).run(id, log.session_id ?? null, log.location, log.logged_at, log.items, log.total_cost_idr, log.image_quality ?? null)
  return id
}

export function confirmWasteLog(logId: string): void {
  db.prepare('UPDATE waste_logs SET confirmed = 1 WHERE id = ?').run(logId)
}

export function getWasteLogs(location: string, limit = 10): WasteLog[] {
  return db
    .prepare('SELECT * FROM waste_logs WHERE location = ? ORDER BY logged_at DESC LIMIT ?')
    .all(location, limit) as WasteLog[]
}

export default db
