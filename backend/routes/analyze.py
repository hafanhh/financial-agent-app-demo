from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from backend.services.claude import analyze_document
from backend.services import db
import asyncio

router = APIRouter()

@router.post("/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...),
    question: str = Form(...),
    persona: str = Form(default="CEO"),
    activeLocation: str = Form(default="Chain-wide"),
    sessionId: str = Form(default=None),
):
    """Analyze uploaded document with Gemini."""
    
    import os
    if not os.getenv("GEMINI_API_KEY"):
        return JSONResponse(
            status_code=503,
            content={"error": "GEMINI_API_KEY not configured on server"},
        )
    
    if not file:
        return JSONResponse(status_code=400, content={"error": "No file uploaded"})
    
    question = question.strip() if question else None
    if not question:
        return JSONResponse(status_code=400, content={"error": "Question is required"})
    
    persona = persona if persona in ["CEO", "StoreManager"] else "CEO"
    activeLocation = activeLocation or "Chain-wide"
    
    try:
        # Read file content
        file_content = await file.read()
        mime_type = file.content_type or "application/octet-stream"
        
        # Call Gemini
        result = await analyze_document(
            file_buffer=file_content,
            mime_type=mime_type,
            original_name=file.filename or "document",
            user_question=question,
            persona=persona,
            activeLocation=activeLocation,
        )
        
        # Save to DB if sessionId provided
        if sessionId:
            db.get_or_create_session(sessionId, persona, activeLocation if persona == "StoreManager" else None)
            
            import time
            now = int(time.time() * 1000)
            
            db.save_message({
                "id": f"u-{now}",
                "session_id": sessionId,
                "role": "user",
                "content": f"[Document: {file.filename}] {question}",
                "citations": None,
                "confidence": None,
                "message_type": "upload",
            })
            
            db.save_message({
                "id": f"a-{now}",
                "session_id": sessionId,
                "role": "agent",
                "content": result.answer,
                "citations": "[" + ", ".join([f'"{c["source"]}"' for c in [c.to_dict() for c in result.citations]]) + "]",
                "confidence": result.confidence,
                "message_type": "analysis",
            })
        
        return result.to_dict()
    
    except Exception as e:
        import traceback
        print(f"[analyze] Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )
