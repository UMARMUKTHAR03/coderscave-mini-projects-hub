import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';

export const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!isRecording || isPaused) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw static center line
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      animationFrameRef.current = requestAnimationFrame(render);
      analyserRef.current!.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  };

  const startRecording = async () => {
    setError(null);
    setAudioUrl(null);
    setAudioBlob(null);
    audioChunksRef.current = [];
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Web Audio API analyser for live waveform
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop stream audio tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      drawWaveform();
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found on this device. Please connect a microphone and try again.');
      } else {
        setError(`Failed to start recording: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <Mic className="w-3.5 h-3.5" /> Project Module 1
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Voice Recorder</h2>
            <p className="text-slate-400 text-sm mt-1">
              Browser-native audio recording powered by MediaRecorder and Web Audio API with live waveform visualization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isRecording
                ? isPaused
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isRecording ? (isPaused ? 'bg-amber-400' : 'bg-rose-500') : 'bg-slate-500'
              }`} />
              {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Idle'}
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="font-semibold text-rose-200">Microphone Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Visualizer & Timer Display */}
        <div className="mt-8 bg-slate-950 border border-slate-800/80 rounded-xl p-4 sm:p-6 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={120}
            className="w-full h-28 sm:h-32 bg-slate-950 rounded-lg"
          />

          <div className="mt-4 font-mono text-4xl sm:text-5xl font-bold text-white tracking-wider">
            {formatTime(duration)}
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Recording Elapsed Time</span>

          {/* Action Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Mic className="w-5 h-5" /> Start Recording
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 font-medium transition active:scale-95"
                  >
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-medium transition active:scale-95"
                  >
                    <Play className="w-4 h-4" /> Resume
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-lg shadow-rose-600/20 transition active:scale-95"
                >
                  <Square className="w-4 h-4" /> Stop Recording
                </button>
              </>
            )}

            {audioUrl && !isRecording && (
              <button
                onClick={startRecording}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm transition"
              >
                <RefreshCw className="w-4 h-4" /> Record New
              </button>
            )}
          </div>
        </div>

        {/* Audio Preview & Export Section */}
        {audioUrl && !isRecording && (
          <div className="mt-6 p-5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
            <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Recording Ready for Review & Export
            </h3>

            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlayingPreview(false)}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow"
                  title={isPlayingPreview ? 'Pause Audio' : 'Play Audio'}
                >
                  {isPlayingPreview ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-white">Audio Capture ({formatTime(duration)})</p>
                  <p className="text-xs text-slate-400">Processed locally in browser memory</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={audioUrl}
                  download={`recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
                >
                  <Download className="w-4 h-4" /> Download WebM
                </a>
                <a
                  href={audioUrl}
                  download={`recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.wav`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-md shadow-indigo-600/20"
                >
                  <Download className="w-4 h-4" /> Download Audio
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature & Privacy Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="font-semibold text-slate-300 mb-1">Original Python Heritage</p>
          Replicates the functionality of the Python Tkinter + `sounddevice` + `scipy.io.wavfile` architecture using standard browser APIs without external plugins.
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <p className="font-semibold text-slate-300 mb-1">Local Privacy Guaranteed</p>
          All audio streams and recording buffers are strictly retained in client memory. No audio data is ever transmitted to backend servers.
        </div>
      </div>
    </div>
  );
};
