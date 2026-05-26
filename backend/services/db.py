import sqlite3
import json
import os
from pathlib import Path
from typing import Optional, List, TypedDict
from datetime import datetime

# Setup data directory
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "baked.db"

class Session(TypedDict):
    id: str
    persona: str
    location: Optional[str]
    created_at: int
    updated_at: int

class Message(TypedDict):
    id: str
    session_id: str
    role: str
    content: str
    citations: Optional[str]
    confidence: Optional[str]
    message_type: Optional[str]
    created_at: int

class WasteItem(TypedDict):
    sku: str
    estimatedUnits: int
    estimatedCostIDR: int
    confidence: str  # 'high' | 'medium' | 'low'
    condition: str   # 'waste' | 'possibly-sellable' | 'unclear'
    notes: Optional[str]

class WasteLog(TypedDict):
    id: str
    session_id: Optional[str]
    location: str
    logged_at: int
    items: str
    total_cost_idr: int
    image_quality: Optional[str]
    confirmed: int

def get_db() -> sqlite3.Connection:
    """Get database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db() -> None:
    """Initialize database tables."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            persona TEXT NOT NULL,
            location TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    """)
    
    cursor.execute("""
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
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS waste_logs (
            id TEXT PRIMARY KEY,
            session_id TEXT,
            location TEXT NOT NULL,
            logged_at INTEGER NOT NULL,
            items TEXT NOT NULL,
            total_cost_idr INTEGER NOT NULL,
            image_quality TEXT,
            confirmed INTEGER DEFAULT 0
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS session_summaries (
            session_id TEXT PRIMARY KEY,
            summary TEXT NOT NULL,
            message_count_at_summary INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()
    print(f"[db] SQLite initialized at {DB_PATH}")

# ── Session operations ────────────────────────────────────────────────────────

def get_or_create_session(
    session_id: str, persona: str, location: Optional[str] = None
) -> Session:
    """Get or create a session."""
    conn = get_db()
    cursor = conn.cursor()
    now = int(datetime.now().timestamp() * 1000)
    
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            "UPDATE sessions SET updated_at = ?, persona = ?, location = ? WHERE id = ?",
            (now, persona, location, session_id),
        )
        conn.commit()
        conn.close()
        return Session(
            id=session_id,
            persona=persona,
            location=location,
            created_at=existing["created_at"],
            updated_at=now,
        )
    
    cursor.execute(
        "INSERT INTO sessions (id, persona, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        (session_id, persona, location, now, now),
    )
    conn.commit()
    conn.close()
    
    return Session(
        id=session_id,
        persona=persona,
        location=location,
        created_at=now,
        updated_at=now,
    )

def get_session(session_id: str) -> Optional[Session]:
    """Get a session by ID."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return Session(
            id=row["id"],
            persona=row["persona"],
            location=row["location"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )
    return None

# ── Message operations ────────────────────────────────────────────────────────

def save_message(msg: dict) -> None:
    """Save a message."""
    conn = get_db()
    cursor = conn.cursor()
    created_at = int(datetime.now().timestamp() * 1000)
    
    cursor.execute(
        """
        INSERT OR REPLACE INTO messages 
        (id, session_id, role, content, citations, confidence, message_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            msg["id"],
            msg["session_id"],
            msg["role"],
            msg["content"],
            msg.get("citations"),
            msg.get("confidence"),
            msg.get("message_type"),
            created_at,
        ),
    )
    conn.commit()
    conn.close()

def get_messages(session_id: str, limit: int = 50) -> List[Message]:
    """Get all messages for a session."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?",
        (session_id, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [
        Message(
            id=row["id"],
            session_id=row["session_id"],
            role=row["role"],
            content=row["content"],
            citations=row["citations"],
            confidence=row["confidence"],
            message_type=row["message_type"],
            created_at=row["created_at"],
        )
        for row in rows
    ]

def get_recent_messages(session_id: str, n: int = 10) -> List[Message]:
    """Get recent messages for a session."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?",
        (session_id, n),
    )
    rows = cursor.fetchall()
    conn.close()
    
    messages = [
        Message(
            id=row["id"],
            session_id=row["session_id"],
            role=row["role"],
            content=row["content"],
            citations=row["citations"],
            confidence=row["confidence"],
            message_type=row["message_type"],
            created_at=row["created_at"],
        )
        for row in rows
    ]
    return list(reversed(messages))

def get_message_count(session_id: str) -> int:
    """Get message count for a session."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return row["cnt"] if row else 0

def clear_messages(session_id: str) -> None:
    """Clear all messages for a session."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM session_summaries WHERE session_id = ?", (session_id,))
    conn.commit()
    conn.close()

# ── Summary operations ────────────────────────────────────────────────────────

def save_summary(session_id: str, summary: str, message_count: int) -> None:
    """Save session summary."""
    conn = get_db()
    cursor = conn.cursor()
    now = int(datetime.now().timestamp() * 1000)
    
    cursor.execute(
        """
        INSERT OR REPLACE INTO session_summaries 
        (session_id, summary, message_count_at_summary, updated_at)
        VALUES (?, ?, ?, ?)
        """,
        (session_id, summary, message_count, now),
    )
    conn.commit()
    conn.close()

def get_summary(session_id: str) -> Optional[str]:
    """Get session summary."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT summary FROM session_summaries WHERE session_id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    return row["summary"] if row else None

# ── Waste log operations ──────────────────────────────────────────────────────

def save_waste_log(log: dict) -> str:
    """Save a waste log entry."""
    conn = get_db()
    cursor = conn.cursor()
    log_id = log.get("id") or f"wl_{int(datetime.now().timestamp() * 1000)}"
    
    cursor.execute(
        """
        INSERT INTO waste_logs 
        (id, session_id, location, logged_at, items, total_cost_idr, image_quality, confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        """,
        (
            log_id,
            log.get("session_id"),
            log["location"],
            log["logged_at"],
            log["items"],
            log["total_cost_idr"],
            log.get("image_quality"),
        ),
    )
    conn.commit()
    conn.close()
    return log_id

def confirm_waste_log(log_id: str) -> None:
    """Confirm a waste log entry."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE waste_logs SET confirmed = 1 WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()

def get_waste_logs(location: str, limit: int = 10) -> List[WasteLog]:
    """Get waste logs for a location."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM waste_logs WHERE location = ? ORDER BY logged_at DESC LIMIT ?",
        (location, limit),
    )
    rows = cursor.fetchall()
    conn.close()
    
    return [
        WasteLog(
            id=row["id"],
            session_id=row["session_id"],
            location=row["location"],
            logged_at=row["logged_at"],
            items=row["items"],
            total_cost_idr=row["total_cost_idr"],
            image_quality=row["image_quality"],
            confirmed=row["confirmed"],
        )
        for row in rows
    ]
