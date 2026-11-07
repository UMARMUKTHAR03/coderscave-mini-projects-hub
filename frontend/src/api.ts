import { HealthResponse, TypingSession, TypingStats } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const LOCAL_STORAGE_SESSIONS_KEY = 'coderscave_local_typing_sessions';

export async function checkApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

export async function fetchTypingHistory(limit = 20): Promise<TypingSession[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/typing/history?limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend unavailable, retrieving local fallback history', err);
  }

  // Local fallback
  const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTypingSession(session: Omit<TypingSession, 'id' | 'created_at'>): Promise<TypingSession> {
  const fallbackSession: TypingSession = {
    ...session,
    id: Date.now(),
    created_at: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/typing/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });

    if (response.ok) {
      const saved = await response.json();
      // Keep local storage in sync
      syncLocalSession(saved);
      return saved;
    }
  } catch (err) {
    console.warn('Backend unreachable, saving session to local fallback storage', err);
  }

  // Save to local storage
  syncLocalSession(fallbackSession);
  return fallbackSession;
}

export async function fetchTypingStats(): Promise<TypingStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/typing/statistics`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend unavailable, calculating local statistics', err);
  }

  // Local calculation fallback
  const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
  const sessions: TypingSession[] = raw ? JSON.parse(raw) : [];

  if (sessions.length === 0) {
    return {
      total_sessions: 0,
      avg_wpm: 0,
      best_wpm: 0,
      avg_accuracy: 0,
      best_accuracy: 0,
      total_time_seconds: 0,
    };
  }

  const total = sessions.length;
  const sumWpm = sessions.reduce((acc, s) => acc + s.wpm, 0);
  const bestWpm = Math.max(...sessions.map(s => s.wpm));
  const sumAcc = sessions.reduce((acc, s) => acc + s.accuracy, 0);
  const bestAcc = Math.max(...sessions.map(s => s.accuracy));
  const totalTime = sessions.reduce((acc, s) => acc + s.duration_seconds, 0);

  return {
    total_sessions: total,
    avg_wpm: Number((sumWpm / total).toFixed(2)),
    best_wpm: Number(bestWpm.toFixed(2)),
    avg_accuracy: Number((sumAcc / total).toFixed(2)),
    best_accuracy: Number(bestAcc.toFixed(2)),
    total_time_seconds: Number(totalTime.toFixed(2)),
  };
}

function syncLocalSession(session: TypingSession) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
    const sessions: TypingSession[] = raw ? JSON.parse(raw) : [];
    sessions.unshift(session);
    // Keep last 50
    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
  } catch (e) {
    console.error('Failed to sync to localStorage', e);
  }
}
