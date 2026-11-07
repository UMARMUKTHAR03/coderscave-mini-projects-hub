import React from 'react';
import { Mic, Keyboard, KeyRound, Calculator as CalcIcon, ExternalLink, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
import { ActiveModule } from '../types';

interface HomeProps {
  onSelectModule: (module: ActiveModule) => void;
  apiConnected: boolean;
}

export const Home: React.FC<HomeProps> = ({ onSelectModule, apiConnected }) => {
  const projects = [
    {
      id: 'voice' as ActiveModule,
      title: 'Voice Recorder',
      originalRepo: 'https://github.com/UMARMUKTHAR03/Voice-Recoder',
      icon: Mic,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40',
      badge: 'Web Audio API',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description: 'Microphone recording with waveform visualization, real-time duration tracking, pause/resume controls, local audio preview, and direct WAV/WebM export.',
      features: ['MediaRecorder API', 'AudioContext Waveform', 'No Cloud Storage Needed', 'Zero Latency Local Capture'],
    },
    {
      id: 'typing' as ActiveModule,
      title: 'Typing Speed Tester',
      originalRepo: 'https://github.com/UMARMUKTHAR03/Typing-Speed-Tester',
      icon: Keyboard,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40',
      badge: 'FastAPI & SQLite',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Interactive typing speed and accuracy testing platform with live character error tracking, dynamic WPM calculation, and persistent SQLite session logs.',
      features: ['Live Error Highlight', 'Real-time WPM & Accuracy', 'SQLite Metrics & Stats', 'Offline Fallback Cache'],
    },
    {
      id: 'password' as ActiveModule,
      title: 'Random Password Generator',
      originalRepo: 'https://github.com/UMARMUKTHAR03/Random-Password-Generator',
      icon: KeyRound,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
      badge: 'Web Crypto API',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Cryptographically secure password generator powered by window.crypto.getRandomValues with granular character selection and entropy strength measurement.',
      features: ['crypto.getRandomValues', 'Guaranteed Diversity', 'Strength Meter', 'Zero Transmission Privacy'],
    },
    {
      id: 'calculator' as ActiveModule,
      title: 'Calculator',
      originalRepo: 'https://github.com/UMARMUKTHAR03/Calculator',
      icon: CalcIcon,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40',
      badge: 'Safe Parser Engine',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Clean responsive calculator featuring a safe 2-pass arithmetic parser, full physical keyboard support, expression history tracking, and divide-by-zero protection.',
      features: ['No eval() Injection Risks', 'Full Keyboard Support', 'Previous Expression Log', 'Safe Decimal Arithmetic'],
    },
  ];

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Zap className="w-3.5 h-3.5" /> CodersCave Python Internship Showcase
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            CodersCave Mini Projects Hub
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
            A unified, full-stack web application consolidating four Python internship projects into clean, responsive, production-ready interactive modules.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onSelectModule('voice')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center gap-2 text-sm"
            >
              Explore Mini Projects <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://github.com/UMARMUKTHAR03"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition"
            >
              GitHub Profile
            </a>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 border-t border-slate-800/80">
            <div>
              <div className="text-2xl font-bold text-white font-mono">4</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Projects Unified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">100%</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Responsive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400 font-mono">FastAPI</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">Backend Engine</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {apiConnected ? 'Online' : 'Offline Mode'}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">System Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Interactive Modules</h2>
            <p className="text-sm text-slate-400 mt-0.5">Select any project to launch its live interactive workbench</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => {
            const Icon = proj.icon;
            return (
              <div
                key={proj.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 hover:shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${proj.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${proj.badgeColor}`}>
                      {proj.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {proj.title}
                  </h3>

                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {proj.features.map((feat, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded-md text-xs border border-slate-800/60">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectModule(proj.id)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition active:scale-95 shadow-md shadow-indigo-600/20"
                  >
                    Open Project <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={proj.originalRepo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
                  >
                    Original Repo <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture & Engineering Highlights */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" /> Platform Architecture & Standards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Client Privacy First
            </p>
            Microphone audio buffers and generated password credentials remain confined to browser memory. No private user telemetry or audio buffers leave client execution.
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> High-Performance Engine
            </p>
            Built on Vite, React 18, and Tailwind CSS with TypeScript strict type safety. Backend services utilize FastAPI with SQLite session logging and aggregate analytics.
          </div>
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" /> Offline Resilient
            </p>
            When the backend is offline or sleeping, the frontend smoothly degrades to local storage caches, maintaining uninterrupted interactive usability.
          </div>
        </div>
      </div>
    </div>
  );
};
