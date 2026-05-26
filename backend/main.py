import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from dotenv import load_dotenv
import logging

# Load .env
load_dotenv()

# Import routes
from backend.routes.analyze import router as analyze_router
from backend.routes.waste_log import router as waste_log_router
from backend.services import db

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize database
db.init_db()

# Create FastAPI app
app = FastAPI(
    title="BAKED API",
    description="Financial Intelligence Platform for BAKED bakery-café chain",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (frontend on localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(analyze_router, prefix="/api", tags=["analyze"])
app.include_router(waste_log_router, prefix="/api", tags=["waste-log"])

# ── Session endpoints ─────────────────────────────────────────────────────────

@app.get("/api/session/{session_id}/stats")
async def get_session_stats(session_id: str):
    """Get session stats (memory indicator)."""
    message_count = db.get_message_count(session_id)
    summary = db.get_summary(session_id)
    session = db.get_session(session_id)
    
    return {
        "messageCount": message_count,
        "summary": summary,
        "createdAt": session["created_at"] if session else None,
        "persona": session["persona"] if session else None,
    }

@app.delete("/api/session/{session_id}")
async def delete_session(session_id: str):
    """Clear all messages for a session."""
    db.clear_messages(session_id)
    return {"ok": True}

@app.post("/api/save-message")
async def save_message(
    sessionId: str = None,
    role: str = None,
    content: str = None,
    messageType: str = None,
    persona: str = None,
    location: str = None,
):
    """Save a chat message."""
    if not sessionId or not role or not content:
        return {"error": "sessionId, role, content required"}, 400
    
    db.get_or_create_session(sessionId, persona or "CEO", location)
    db.save_message({
        "id": f"msg_{int(__import__('time').time() * 1000)}_abc123",
        "session_id": sessionId,
        "role": role,
        "content": content,
        "citations": None,
        "confidence": None,
        "message_type": messageType or "chat",
    })
    
    return {"ok": True}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return RedirectResponse(url="http://localhost:8080")

@app.get("/favicon.ico")
@app.get("/apple-touch-icon.png")
@app.get("/apple-touch-icon-precomposed.png")
async def favicon():
    return Response(status_code=204)

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("SERVER_PORT", 3001))
    
    if not os.getenv("GEMINI_API_KEY"):
        logger.warning("⚠  GEMINI_API_KEY not set — /api/analyze will return 503")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
    )
