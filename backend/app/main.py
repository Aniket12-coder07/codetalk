"""
CodeTalk FastAPI Backend Server
Provides WebSocket streaming audio bridge to AssemblyAI
and REST endpoints for question bank & interviewer reasoning feedback.
"""

import os
import json
import asyncio
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load environment variables from .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("codetalk.main")

# Initialize FastAPI application
app = FastAPI(
    title="CodeTalk API",
    description="Voice-based technical interview simulator powered by AssemblyAI and Claude",
    version="1.0.0",
)

# Configure CORS
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.onrender\.app)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Questions Bank
QUESTIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "questions.json"
questions_cache: List[Dict[str, Any]] = []

def load_questions() -> List[Dict[str, Any]]:
    global questions_cache
    if not questions_cache:
        if QUESTIONS_PATH.exists():
            with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
                questions_cache = json.load(f)
        else:
            logger.warning(f"Questions file not found at {QUESTIONS_PATH}")
            questions_cache = []
    return questions_cache

@app.get("/")
async def root():
    """Root landing endpoint providing API status and documentation links."""
    questions = load_questions()
    return {
        "message": "Welcome to CodeTalk API - Voice-Based Technical Interview Simulator",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "questions": "/api/questions",
            "reasoning": "/api/interview/reasoning",
            "review": "/api/interview/review"
        },
        "questions_loaded": len(questions)
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint indicating API and key status."""
    aai_key = os.getenv("ASSEMBLYAI_API_KEY", "").strip()
    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()

    return {
        "status": "online",
        "service": "CodeTalk Backend",
        "assemblyai_configured": bool(aai_key and not aai_key.startswith("your_")),
        "anthropic_configured": bool(anthropic_key and not anthropic_key.startswith("your_")),
        "questions_loaded": len(load_questions()),
    }

@app.get("/api/questions")
async def get_questions():
    """Returns all available DSA problems in the question bank."""
    return load_questions()

@app.get("/api/questions/{question_id}")
async def get_question(question_id: str):
    """Returns details for a specific question."""
    questions = load_questions()
    for q in questions:
        if q.get("id") == question_id:
            return q
    raise HTTPException(status_code=404, detail="Question not found")

# Lazy import transcriber to handle environment flexibly
from app.transcriber import AssemblyAITranscriberBridge

@app.websocket("/ws/transcribe")
async def websocket_transcribe(
    websocket: WebSocket,
    sample_rate: int = Query(default=16000),
    mock: bool = Query(default=False),
):
    """
    WebSocket endpoint for real-time speech-to-text.
    Expects binary audio chunks (16kHz 16-bit PCM mono).
    Returns JSON stream with partial and final transcription results.
    """
    await websocket.accept()
    logger.info(f"WebSocket client connected to /ws/transcribe (sample_rate={sample_rate}, mock={mock})")

    loop = asyncio.get_running_loop()
    transcript_queue: asyncio.Queue = asyncio.Queue()

    bridge = AssemblyAITranscriberBridge(
        loop=loop,
        transcript_queue=transcript_queue,
        sample_rate=sample_rate,
    )
    if mock:
        bridge.mock_mode = True

    try:
        bridge.connect()
    except Exception as e:
        logger.error(f"Failed to connect to AssemblyAI: {e}")
        await websocket.send_json({"type": "error", "error": f"AssemblyAI connection failed: {str(e)}"})
        await websocket.close()
        return

    # Task to forward transcripts from internal queue to the client WebSocket
    async def forward_transcripts():
        try:
            while True:
                msg = await transcript_queue.get()
                await websocket.send_json(msg)
                transcript_queue.task_done()
        except asyncio.CancelledError:
            pass
        except Exception as err:
            logger.debug(f"Transcript forwarding ended: {err}")

    forward_task = asyncio.create_task(forward_transcripts())

    try:
        while True:
            # Client sends binary audio frames (PCM bytes) or text control messages
            message = await websocket.receive()
            if "bytes" in message and message["bytes"]:
                audio_bytes = message["bytes"]
                bridge.stream_chunk(audio_bytes)
            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    if payload.get("action") == "ping":
                        await websocket.send_json({"type": "pong"})
                    elif payload.get("action") == "end_speech":
                        await websocket.send_json({"type": "speech_ended"})
                except json.JSONDecodeError:
                    pass
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/transcribe.")
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
    finally:
        forward_task.cancel()
        bridge.close()
        try:
            await websocket.close()
        except Exception:
            pass
        logger.info("Cleaned up WebSocket transcription session.")

# Models and endpoints for Interviewer Reasoning & Code Review
class FollowupRequest(BaseModel):
    question_id: str
    transcript: str
    code: Optional[str] = None
    chat_history: Optional[List[Dict[str, str]]] = []

class ReviewRequest(BaseModel):
    question_id: str
    transcript: str
    code: str
    language: Optional[str] = "python"

@app.post("/api/interview/followup")
async def interview_followup(req: FollowupRequest):
    """
    Evaluates current verbal reasoning and generates an interviewer follow-up question.
    """
    from app.interviewer import generate_followup
    try:
        result = await generate_followup(
            question_id=req.question_id,
            transcript=req.transcript,
            code=req.code,
            chat_history=req.chat_history or [],
        )
        return result
    except Exception as e:
        logger.error(f"Error generating follow-up: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/interview/review")
async def interview_review(req: ReviewRequest):
    """
    Evaluates submitted code alongside verbal reasoning for comprehensive feedback.
    """
    from app.interviewer import evaluate_submission
    try:
        result = await evaluate_submission(
            question_id=req.question_id,
            transcript=req.transcript,
            code=req.code,
            language=req.language or "python",
        )
        return result
    except Exception as e:
        logger.error(f"Error evaluating submission: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
