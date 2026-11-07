import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, RotateCcw, Award, TrendingUp, Clock, History } from 'lucide-react';
import { saveTypingSession, fetchTypingHistory, fetchTypingStats } from '../api';
import { TypingSession, TypingStats } from '../types';

const PRACTICE_SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a sunny afternoon.",
  "Programming is the art of algorithm design and problem solving using structured computational logic.",
  "Modern web applications combine responsive user interfaces with asynchronous backend application programming interfaces.",
  "Continuous integration and automated testing ensure consistent software quality and rapid reliable deployments.",
  "Machine learning models require clean preprocessing pipelines, balanced datasets, and careful metric evaluation.",
  "Cryptographically secure pseudo random number generators protect modern authentication and key derivation systems.",
  "Python and TypeScript provide versatile developer ecosystems for building both scalable services and interactive clients."
];

export const TypingSpeedTester: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [history, setHistory] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const timerRef = useRef<any>(null);

  // Initialize random prompt
  useEffect(() => {
    resetTest();
    loadHistoryAndStats();
  }, []);

  const loadHistoryAndStats = async () => {
    const [h, s] = await Promise.all([
      fetchTypingHistory(5),
      fetchTypingStats(),
    ]);
    setHistory(h);
    setStats(s);
  };

  const selectRandomPrompt = () => {
    const idx = Math.floor(Math.random() * PRACTICE_SENTENCES.length);
    return PRACTICE_SENTENCES[idx];
  };

  const resetTest = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newPrompt = selectRandomPrompt();
    setPrompt(newPrompt);
    setInput('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsTestActive(false);
    setIsCompleted(false);
    setWpm(0);
    setAccuracy(100);
    setErrorCount(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Live calculation of WPM and accuracy
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (isCompleted) return;

    if (!isTestActive) {
      setIsTestActive(true);
      const now = Date.now();
      setStartTime(now);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    setInput(val);

    // Compute error count against prompt up to current length
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== prompt[i]) {
        errors++;
      }
    }
    setErrorCount(errors);

    // Live word accuracy matching original Python app:
    // correct words / total words in prompt
    const typedWords = val.trim().split(/\s+/).filter(Boolean);
    const promptWords = prompt.trim().split(/\s+/).filter(Boolean);
    let correctWords = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] === promptWords[i]) {
        correctWords++;
      }
    }

    const currentDurationSecs = startTime ? Math.max((Date.now() - startTime) / 1000, 1) : 1;
    // Standard WPM: (characters typed / 5) / (minutes elapsed)
    const calculatedWpm = Math.max(0, Math.round((val.length / 5) / (currentDurationSecs / 60)));
    setWpm(calculatedWpm);

    const calculatedAccuracy = val.length > 0
      ? Math.max(0, Math.min(100, Math.round(((val.length - errors) / val.length) * 100)))
      : 100;
    setAccuracy(calculatedAccuracy);

    // Check if test completed
    if (val.length >= prompt.length) {
      completeTest(val, currentDurationSecs);
    }
  };

  const completeTest = async (finalInput: string, durationSecs: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTestActive(false);
    setIsCompleted(true);

    const promptWords = prompt.trim().split(/\s+/).filter(Boolean);
    const typedWords = finalInput.trim().split(/\s+/).filter(Boolean);

    let correctWords = 0;
    for (let i = 0; i < typedWords.length; i++) {
      if (typedWords[i] === promptWords[i]) {
        correctWords++;
      }
    }

    let finalErrors = 0;
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] !== prompt[i]) {
        finalErrors++;
      }
    }

    const finalWpm = Math.max(0, Math.round((finalInput.length / 5) / (Math.max(durationSecs, 1) / 60)));
    const finalAccuracy = finalInput.length > 0
      ? Math.max(0, Math.min(100, Math.round(((finalInput.length - finalErrors) / finalInput.length) * 100)))
      : 100;
    const errorPct = Number((100 - finalAccuracy).toFixed(2));

    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setErrorCount(finalErrors);

    // Save session to backend / SQLite
    setIsSaving(true);
    try {
      await saveTypingSession({
        wpm: finalWpm,
        accuracy: finalAccuracy,
        duration_seconds: Math.round(durationSecs * 10) / 10,
        total_words: promptWords.length,
        correct_words: correctWords,
        incorrect_chars: finalErrors,
        error_percentage: errorPct,
      });
      await loadHistoryAndStats();
    } catch (e) {
      console.error('Failed to persist session:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Keyboard className="w-3.5 h-3.5" /> Project Module 2
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Typing Speed Tester</h2>
            <p className="text-slate-400 text-sm mt-1">
              Recreation of the original Python Tkinter typing tester with real-time WPM, accuracy analysis, and SQLite performance metrics.
            </p>
          </div>

          <button
            onClick={resetTest}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" /> Restart Test
          </button>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Speed</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{wpm} <span className="text-xs text-slate-400 font-sans">WPM</span></div>
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Accuracy</span>
            <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{accuracy}%</div>
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Errors</span>
            <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{errorCount} <span className="text-xs text-slate-400 font-sans">chars</span></div>
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Duration</span>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" /> {elapsedSeconds}s
            </div>
          </div>
        </div>

        {/* Practice Prompt Display */}
        <div className="mt-6 p-5 bg-slate-950 border border-slate-800 rounded-xl select-none">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2">Practice Sentence</p>
          <div className="text-base sm:text-lg leading-relaxed font-mono font-medium">
            {prompt.split('').map((char, index) => {
              let color = 'text-slate-400';
              if (index < input.length) {
                color = input[index] === char ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/20';
              } else if (index === input.length) {
                color = 'text-indigo-400 underline decoration-indigo-500 decoration-2';
              }
              return (
                <span key={index} className={`${color} rounded-sm px-0.5 transition-colors duration-75`}>
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Interactive Typing Input */}
        <div className="mt-4">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            disabled={isCompleted}
            rows={3}
            placeholder={isCompleted ? "Test finished! Click 'Restart Test' for another round." : "Start typing the sentence above to begin timer..."}
            className={`w-full p-4 rounded-xl bg-slate-950 border text-slate-100 font-mono text-base focus:outline-none transition resize-none ${
              isCompleted
                ? 'border-emerald-500/50 bg-emerald-950/10'
                : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
            }`}
          />
        </div>

        {/* Results Banner */}
        {isCompleted && (
          <div className="mt-6 p-6 bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-500/30 rounded-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Test Completed!</h3>
                  <p className="text-sm text-slate-300">
                    Calculated <span className="font-semibold text-emerald-400">{wpm} WPM</span> with{' '}
                    <span className="font-semibold text-indigo-400">{accuracy}% accuracy</span> in {elapsedSeconds}s.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isSaving && (
                  <span className="text-xs text-indigo-400 animate-pulse">Saving to database...</span>
                )}
                <button
                  onClick={resetTest}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/20"
                >
                  Try Another Prompt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Aggregate Statistics and History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Progress Stats */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Performance Stats</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Total Tests Taken</span>
              <span className="font-mono font-bold text-white">{stats?.total_sessions || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Average Speed</span>
              <span className="font-mono font-bold text-emerald-400">{stats?.avg_wpm || 0} WPM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Personal Best WPM</span>
              <span className="font-mono font-bold text-indigo-400">{stats?.best_wpm || 0} WPM</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Average Accuracy</span>
              <span className="font-mono font-bold text-slate-200">{stats?.avg_accuracy || 0}%</span>
            </div>
          </div>
        </div>

        {/* Recent Session History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Recent Test History</h3>
            </div>
            <span className="text-xs text-slate-500">Stored via FastAPI & SQLite</span>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-slate-500 italic py-6 text-center">
              No typing sessions recorded yet. Complete a test above to record your score!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-3">Date / Time</th>
                    <th className="py-2 px-3">Speed</th>
                    <th className="py-2 px-3">Accuracy</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {history.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-400 font-sans">
                        {s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Local'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-bold">{s.wpm} WPM</td>
                      <td className="py-2.5 px-3 text-indigo-300">{s.accuracy}%</td>
                      <td className="py-2.5 px-3 text-slate-300">{s.duration_seconds}s</td>
                      <td className="py-2.5 px-3 text-rose-400">{s.incorrect_chars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
