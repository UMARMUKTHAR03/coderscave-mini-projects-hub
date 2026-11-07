export interface TypingSession {
  id?: number;
  wpm: number;
  accuracy: number;
  duration_seconds: number;
  total_words: number;
  correct_words: number;
  incorrect_chars: number;
  error_percentage: number;
  created_at?: string;
}

export interface TypingStats {
  total_sessions: number;
  avg_wpm: number;
  best_wpm: number;
  avg_accuracy: number;
  best_accuracy: number;
  total_time_seconds: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  service: string;
}

export type ActiveModule = 'home' | 'voice' | 'typing' | 'password' | 'calculator';

