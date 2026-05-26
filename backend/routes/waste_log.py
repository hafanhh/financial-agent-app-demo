from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from backend.services.claude import analyze_waste
from backend.services import db
import asyncio

router = APIRouter()

@router.post("/waste-log")
async def waste_log_endpoint(
    file: UploadFile = File(...),
    location: str = Form(default="Unknown"),
    sessionId: str = Form(default=None),
):
    """Analyze waste photo via Gemini."""
    
    import os
    if not os.getenv("GEMINI_API_KEY"):
        return JSONResponse(
            status_code=503,
            content={"error": "GEMINI_API_KEY not set"},
        )
    
    if not file:
        return JSONResponse(status_code=400, content={"error": "Image file required"})
    
    location = location or "Unknown"
    mime_type = file.content_type or "image/jpeg"
    
    # Validate MIME type
    allowed_mimes = ["image/jpeg", "image/png", "image/webp"]
    if mime_type not in allowed_mimes:
        return JSONResponse(
            status_code=400,
            content={"error": f"Invalid file type. Allowed: {', '.join(allowed_mimes)}"},
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Call Gemini
        result = await analyze_waste(
            file_buffer=file_content,
            mime_type=mime_type,
            location=location,
        )
        
        # Save to DB
        import time
        log_id = db.save_waste_log({
            "id": None,
            "session_id": sessionId,
            "location": location,
            "logged_at": int(time.time() * 1000),
            "items": str([item.to_dict() for item in result.wasteItems]),
            "total_cost_idr": result.totalEstimatedWasteCostIDR,
            "image_quality": result.imageQuality,
        })
        
        # Ensure session exists if provided
        if sessionId:
            db.get_or_create_session(sessionId, "StoreManager", location)
        
        return {
            "logId": log_id,
            **result.to_dict(),
        }
    
    except Exception as e:
        import traceback
        print(f"[waste-log] Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )

@router.post("/waste-log/{log_id}/confirm")
async def confirm_waste_log_endpoint(log_id: str):
    """Confirm a waste log entry."""
    try:
        db.confirm_waste_log(log_id)
        return JSONResponse(content={"ok": True, "logId": log_id})
    except Exception as e:
        import traceback
        print(f"[waste-log-confirm] Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )
