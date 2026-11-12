import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from celery.result import AsyncResult
from app.tasks import process_court_audio_task
from app.worker import celery_app

app = FastAPI(title="JudiCore Legal Transcription API")

# Allow communication with your frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/court_recordings")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "JudiCore Legal Transcription API",
        "whisper_enabled": True
    }

@app.post("/api/ingest")
async def ingest_court_recording(file: UploadFile = File(...)):
    """Receives court audio file and passes it to the background processing queue"""
    # Verify file extension format
    allowed_extensions = [".aac", ".mp3", ".wav", ".m4a"]
    _, ext = os.path.splitext(file.filename.lower())
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported audio configuration format.")
    
    # Generate a secure unique identifier for the transaction tracking layer
    job_id = str(uuid.uuid4())
    secure_filename = f"{job_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, secure_filename)
    
    # Stream write the incoming buffer payload to storage disc
    try:
        with open(file_path, "wb") as f:
            while chunk := await file.read(64 * 1024):
                f.write(chunk)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save execution failed: {str(e)}")
        
    # Kick off asynchronous transcription background pipeline
    task = process_court_audio_task.delay(file_path, job_id)
    
    return {"job_id": job_id, "task_id": task.id, "status": "Queued for processing"}

@app.get("/api/transcript/status/{task_id}")
async def get_transcription_status(task_id: str):
    """Polled by the frontend to watch execution state and download finished content"""
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == "PENDING":
        return {"status": "Processing in pipeline", "result": None}
    elif task_result.state == "FAILURE":
        return {"status": "Failed", "error": str(task_result.info)}
    elif task_result.state == "SUCCESS":
        return {"status": "Completed", "transcript": task_result.result}
        
    return {"status": task_result.state, "result": None}
