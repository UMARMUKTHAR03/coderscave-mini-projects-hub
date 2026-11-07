from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TypingSessionCreate(BaseModel):
    wpm: float = Field(..., ge=0, le=300, description="Words per minute")
    accuracy: float = Field(..., ge=0, le=100, description="Accuracy percentage")
    duration_seconds: float = Field(..., ge=1, le=600, description="Test duration in seconds")
    total_words: int = Field(..., ge=0, description="Total words in reference prompt")
    correct_words: int = Field(..., ge=0, description="Number of correctly typed words")
    incorrect_chars: int = Field(..., ge=0, description="Number of mistyped characters")
    error_percentage: float = Field(..., ge=0, le=100, description="Error percentage")

class TypingSessionResponse(BaseModel):
    id: int
    wpm: float
    accuracy: float
    duration_seconds: float
    total_words: int
    correct_words: int
    incorrect_chars: int
    error_percentage: float
    created_at: str

class TypingStats(BaseModel):
    total_sessions: int
    avg_wpm: float
    best_wpm: float
    avg_accuracy: float
    best_accuracy: float
    total_time_seconds: float

class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    service: str

