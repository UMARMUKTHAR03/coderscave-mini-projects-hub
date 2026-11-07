import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    TypingSessionCreate,
    TypingSessionResponse,
    TypingStats,
    HealthResponse,
)
from app.database import (
    init_db,
    save_typing_session,
    get_typing_sessions,
    get_typing_statistics,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="CodersCave Mini Projects Hub API",
    description="Backend services for CodersCave Mini Projects Hub (Typing speed metrics, statistics, health checks)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
env_mode = os.environ.get("ENVIRONMENT", "development").lower()
custom_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
parsed_custom = [o.strip() for o in custom_origins_env.split(",") if o.strip()]

default_origins = [
    "https://umarmukthar03.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

allowed_origins = list(set(default_origins + parsed_custom))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if env_mode != "production" else (["https://umarmukthar03.github.io"] + parsed_custom),
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "CodersCave Mini Projects Hub API",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": "1.0.0"
    }

@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "coderscave-mini-projects-hub-api",
    }

@app.get("/api/typing/history", response_model=List[TypingSessionResponse])
def get_history(limit: int = Query(50, ge=1, le=200)):
    try:
        return get_typing_sessions(limit=limit)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch typing history: {str(e)}",
        )

@app.post("/api/typing/sessions", response_model=TypingSessionResponse, status_code=status.HTTP_201_CREATED)
def record_session(session: TypingSessionCreate):
    try:
        session_id = save_typing_session(session.model_dump())
        sessions = get_typing_sessions(limit=1)
        if sessions and sessions[0]["id"] == session_id:
            return sessions[0]
        # Fallback return
        return {
            "id": session_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            **session.model_dump()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save typing session: {str(e)}",
        )

@app.get("/api/typing/statistics", response_model=TypingStats)
def get_stats():
    try:
        return get_typing_statistics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate typing statistics: {str(e)}",
        )
