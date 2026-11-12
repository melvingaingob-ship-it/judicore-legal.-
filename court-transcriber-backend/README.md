# JudiCore Legal Transcription API

High-performance court audio transcription and diarization backend powered by FastAPI, Celery, Redis, and OpenAI Whisper.

## Architecture

```
court-transcriber-backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application server entrypoint
│   ├── config.py        # Environment variables & API configuration
│   ├── tasks.py         # Celery task definitions (Whisper process execution)
│   └── worker.py        # Celery worker initialization instance
├── requirements.txt     # Backend core package dependencies
└── .env                 # API Keys and storage paths
```

## Setup & Running

1. **Install Dependencies**:
   ```bash
   cd court-transcriber-backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Start Redis Broker**:
   ```bash
   redis-server
   ```

3. **Start Celery Worker**:
   ```bash
   celery -A app.worker.celery_app worker --loglevel=info
   ```

4. **Start FastAPI Application Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Endpoints

- `POST /api/ingest`: Multipart audio upload (`.aac`, `.mp3`, `.wav`, `.m4a`). Returns `{"job_id": "...", "task_id": "...", "status": "Queued for processing"}`.
- `GET /api/transcript/status/{task_id}`: Polls Celery async execution status:
  - `{"status": "Processing in pipeline", "result": null}`
  - `{"status": "Completed", "transcript": { "metadata": { ... }, "turns": [ ... ] }}`
  - `{"status": "Failed", "error": "..."}`
