import pytest
import os
import sys

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path, monkeypatch):
    test_db = tmp_path / "test_hub.db"
    monkeypatch.setattr("app.database.DB_PATH", str(test_db))
    init_db()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "version" in data

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "coderscave-mini-projects-hub-api"
    assert "timestamp" in data

def test_typing_session_creation_and_history(client):
    payload = {
        "wpm": 65.4,
        "accuracy": 98.2,
        "duration_seconds": 30.0,
        "total_words": 35,
        "correct_words": 34,
        "incorrect_chars": 2,
        "error_percentage": 1.8
    }
    response = client.post("/api/typing/sessions", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] > 0
    assert created["wpm"] == 65.4
    assert created["accuracy"] == 98.2
    assert "created_at" in created

    # Test history retrieval
    hist_res = client.get("/api/typing/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) == 1
    assert history[0]["id"] == created["id"]

def test_typing_statistics_calculation(client):
    # Add two sessions
    client.post("/api/typing/sessions", json={
        "wpm": 50.0,
        "accuracy": 90.0,
        "duration_seconds": 20.0,
        "total_words": 20,
        "correct_words": 18,
        "incorrect_chars": 3,
        "error_percentage": 10.0
    })
    client.post("/api/typing/sessions", json={
        "wpm": 70.0,
        "accuracy": 100.0,
        "duration_seconds": 40.0,
        "total_words": 40,
        "correct_words": 40,
        "incorrect_chars": 0,
        "error_percentage": 0.0
    })

    stats_res = client.get("/api/typing/statistics")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_sessions"] == 2
    assert stats["avg_wpm"] == 60.0
    assert stats["best_wpm"] == 70.0
    assert stats["avg_accuracy"] == 95.0
    assert stats["best_accuracy"] == 100.0
    assert stats["total_time_seconds"] == 60.0

def test_typing_session_validation_error(client):
    # Missing required fields
    response = client.post("/api/typing/sessions", json={"wpm": 45.0})
    assert response.status_code == 422

    # Negative value validation
    invalid_payload = {
        "wpm": -10.0,
        "accuracy": 150.0, # invalid > 100
        "duration_seconds": 30.0,
        "total_words": 35,
        "correct_words": 34,
        "incorrect_chars": 2,
        "error_percentage": 1.8
    }
    invalid_res = client.post("/api/typing/sessions", json=invalid_payload)
    assert invalid_res.status_code == 422
