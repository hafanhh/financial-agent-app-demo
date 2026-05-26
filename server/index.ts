import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { analyzeRouter } from './routes/analyze.js'
import { wasteLogRouter } from './routes/waste-log.js'
import { initDb, getMessageCount, getSession, getSummary, clearMessages, getOrCreateSession, saveMessage } from './services/db.js'

dotenv.config()

initDb()

const app = express()
const PORT = process.env.SERVER_PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/api', analyzeRouter)
app.use('/api/waste-log', wasteLogRouter)

// GET /api/session/:id/stats — memory indicator
app.get('/api/session/:id/stats', (req, res) => {
  const { id } = req.params
  const count = getMessageCount(id)
  const summary = getSummary(id)
  const session = getSession(id)
  res.json({
    messageCount: count,
    summary: summary ?? null,
    createdAt: session?.created_at ?? null,
    persona: session?.persona ?? null,
  })
})

// DELETE /api/session/:id — clear memory
app.delete('/api/session/:id', (req, res) => {
  const { id } = req.params
  clearMessages(id)
  res.json({ ok: true })
})

// POST /api/save-message — save a chat message from the frontend (mock flow)
app.post('/api/save-message', (req, res) => {
  const { sessionId, role, content, messageType, persona, location } = req.body as {
    sessionId?: string
    role: string
    content: string
    messageType?: string
    persona?: string
    location?: string
  }
  if (!sessionId || !role || !content) {
    res.status(400).json({ error: 'sessionId, role, content required' })
    return
  }
  getOrCreateSession(sessionId, persona ?? 'CEO', location)
  saveMessage({
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    session_id: sessionId,
    role,
    content,
    citations: null,
    confidence: null,
    message_type: messageType ?? 'chat',
  })
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`BAKED API server running on :${PORT}`)
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠  GEMINI_API_KEY not set — /api/analyze will return 503')
  }
})
