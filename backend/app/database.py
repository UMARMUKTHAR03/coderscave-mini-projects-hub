import os
import sqlite3
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone

DATABASE_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.makedirs(DATABASE_DIR, exist_ok=True)
DB_PATH = os.path.join(DATABASE_DIR, "coderscave_hub.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS typing_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wpm REAL NOT NULL,
            accuracy REAL NOT NULL,
            duration_seconds REAL NOT NULL,
            total_words INTEGER NOT NULL,
            correct_words INTEGER NOT NULL,
            incorrect_chars INTEGER NOT NULL,
            error_percentage REAL NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def save_typing_session(session_data: Dict[str, Any]) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    created_at = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
        INSERT INTO typing_sessions (
            wpm, accuracy, duration_seconds, total_words,
            correct_words, incorrect_chars, error_percentage, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        round(session_data["wpm"], 2),
        round(session_data["accuracy"], 2),
        round(session_data["duration_seconds"], 2),
        session_data["total_words"],
        session_data["correct_words"],
        session_data["incorrect_chars"],
        round(session_data["error_percentage"], 2),
        created_at
    ))
    conn.commit()
    session_id = cursor.lastrowid
    conn.close()
    return session_id

def get_typing_sessions(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, wpm, accuracy, duration_seconds, total_words,
               correct_words, incorrect_chars, error_percentage, created_at
        FROM typing_sessions
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_typing_statistics() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            COUNT(*) as total_sessions,
            COALESCE(AVG(wpm), 0) as avg_wpm,
            COALESCE(MAX(wpm), 0) as best_wpm,
            COALESCE(AVG(accuracy), 0) as avg_accuracy,
            COALESCE(MAX(accuracy), 0) as best_accuracy,
            COALESCE(SUM(duration_seconds), 0) as total_time_seconds
        FROM typing_sessions
    """)
    row = cursor.fetchone()
    conn.close()
    if not row:
        return {
            "total_sessions": 0,
            "avg_wpm": 0.0,
            "best_wpm": 0.0,
            "avg_accuracy": 0.0,
            "best_accuracy": 0.0,
            "total_time_seconds": 0.0
        }
    return {
        "total_sessions": row["total_sessions"],
        "avg_wpm": round(row["avg_wpm"], 2),
        "best_wpm": round(row["best_wpm"], 2),
        "avg_accuracy": round(row["avg_accuracy"], 2),
        "best_accuracy": round(row["best_accuracy"], 2),
        "total_time_seconds": round(row["total_time_seconds"], 2)
    }

