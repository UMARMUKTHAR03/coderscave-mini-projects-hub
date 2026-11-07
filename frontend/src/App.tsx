import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, Mic, Keyboard, KeyRound, Calculator as CalcIcon, Activity, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { ActiveModule } from './types';
import { checkApiHealth } from './api';

import { Home } from './components/Home';
import { VoiceRecorder } from './components/VoiceRecorder';
import { TypingSpeedTester } from './components/TypingSpeedTester';
import { PasswordGenerator } from './components/PasswordGenerator';
import { Calculator } from './components/Calculator';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [apiChecking, setApiChecking] = useState<boolean>(true);

  // Poll / verify API health
  const verifyApi = async () => {
    setApiChecking(true);
    try {
      await checkApiHealth();
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    } finally {
      setApiChecking(false);
    }
  };

  useEffect(() => {
    verifyApi();
    const interval = setInterval(verifyApi, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home' as ActiveModule, label: 'Dashboard', icon: HomeIcon },
    { id: 'voice' as ActiveModule, label: 'Voice Recorder', icon: Mic },
    { id: 'typing' as ActiveModule, label: 'Typing Tester', icon: Keyboard },
    { id: 'password' as ActiveModule, label: 'Password Gen', icon: KeyRound },
    { id: 'calculator' as ActiveModule, label: 'Calculator', icon: CalcIcon },
  ];

  const handleNavClick = (id: ActiveModule) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                CodersCave <span className="text-indigo-400 font-semibold text-xs px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">Hub</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 -mt-0.5 tracking-wider uppercase">Python Mini Projects</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* API Health Pill & GitHub Link */}
          <div className="flex items-center gap-3">
            <button
              onClick={verifyApi}
              title="Click to refresh backend connection status"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
                apiChecking
                  ? 'bg-slate-800 text-slate-400 border-slate-700 animate-pulse'
                  : apiConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {apiConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{apiChecking ? 'Checking...' : apiConnected ? 'API Online' : 'Local Mode'}</span>
            </button>

            <a
              href="https://github.com/UMARMUKTHAR03"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="GitHub Profile"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeModule === 'home' && (
          <Home
            onSelectModule={(mod) => handleNavClick(mod)}
            apiConnected={apiConnected}
          />
        )}
        {activeModule === 'voice' && <VoiceRecorder />}
        {activeModule === 'typing' && <TypingSpeedTester />}
        {activeModule === 'password' && <PasswordGenerator />}
        {activeModule === 'calculator' && <Calculator />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-semibold text-slate-300">CodersCave Mini Projects Hub</p>
            <p className="text-slate-500 mt-0.5">
              Consolidated full-stack portfolio unifying Voice Recorder, Typing Speed Tester, Password Generator, and Calculator.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <a
              href="https://github.com/UMARMUKTHAR03/Voice-Recoder"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition"
            >
              Voice-Recoder
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/UMARMUKTHAR03/Typing-Speed-Tester"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition"
            >
              Typing-Speed-Tester
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/UMARMUKTHAR03/Random-Password-Generator"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition"
            >
              Password-Generator
            </a>
            <span className="text-slate-700">•</span>
            <a
              href="https://github.com/UMARMUKTHAR03/Calculator"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-400 transition"
            >
              Calculator
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
