import os
from app.worker import celery_app
# Alternative providers can scale through packages like `openai` or `faster-whisper`
import whisper 

@celery_app.task(bind=True)
def process_court_audio_task(self, file_path: str, job_id: str):
    """Executes local machine learning model transcription inside dedicated processing thread"""
    if not os.path.exists(file_path):
        return {"error": "Target recording node not found on local mount path."}
        
    try:
        # Load local specialized ASR model weights (Base/Medium/Large based on resource availability)
        print(f"Initializing transcription loop for Core Transaction Target: {job_id}")
        model = whisper.load_model("base")
        
        # Parse audio file stream into textual frames 
        # temperature_increment_on_fallback helps handle echoing courtroom spaces
        result = model.transcribe(file_path, beam_size=5, best_of=5)
        
        formatted_dialogue_turns = []
        for segment in result.get("segments", []):
            formatted_dialogue_turns.append({
                "id": segment.get("id"),
                "start_time": round(segment.get("start"), 2),
                "end_time": round(segment.get("end"), 2),
                "text": segment.get("text", "").strip(),
                "speaker": "Speaker Track Unavailable" # Speaker diarization requires PyAnnote module integration
            })
            
        # Clean up temporary disk storage dependencies once payload is cached
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return {
            "metadata": {
                "job_id": job_id,
                "total_duration_secs": round(result.get("duration", 0), 2)
            },
            "turns": formatted_dialogue_turns
        }
        
    except Exception as err:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise err
