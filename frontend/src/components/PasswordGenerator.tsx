import React, { useState } from 'react';
import { KeyRound, Copy, Check, RefreshCw, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [useLowercase, setUseLowercase] = useState<boolean>(true);
  const [useUppercase, setUseUppercase] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Character pools
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  // Cryptographically secure generation using Web Crypto API
  const generatePassword = () => {
    setValidationError(null);
    setCopied(false);

    let charPool = '';
    const guaranteedChars: string[] = [];

    // Helper to get random character using crypto.getRandomValues
    const getCryptoChar = (chars: string): string => {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return chars[array[0] % chars.length];
    };

    if (useLowercase) {
      charPool += LOWERCASE;
      guaranteedChars.push(getCryptoChar(LOWERCASE));
    }
    if (useUppercase) {
      charPool += UPPERCASE;
      guaranteedChars.push(getCryptoChar(UPPERCASE));
    }
    if (useNumbers) {
      charPool += NUMBERS;
      guaranteedChars.push(getCryptoChar(NUMBERS));
    }
    if (useSymbols) {
      charPool += SYMBOLS;
      guaranteedChars.push(getCryptoChar(SYMBOLS));
    }

    if (!charPool) {
      setValidationError('Please select at least one character set (lowercase, uppercase, numbers, or symbols).');
      setPassword('');
      return;
    }

    if (length < 4 || length > 64) {
      setValidationError('Password length must be between 4 and 64 characters.');
      return;
    }

    const remainingCount = length - guaranteedChars.length;
    const resultChars: string[] = [...guaranteedChars];

    if (remainingCount > 0) {
      const randomValues = new Uint32Array(remainingCount);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < remainingCount; i++) {
        resultChars.push(charPool[randomValues[i] % charPool.length]);
      }
    }

    // Cryptographic shuffle of the assembled characters
    const shuffleArray = new Uint32Array(resultChars.length);
    window.crypto.getRandomValues(shuffleArray);
    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = shuffleArray[i] % (i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    const generated = resultChars.join('').slice(0, length);
    setPassword(generated);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  // Evaluate password strength
  const getStrength = () => {
    if (!password) return { label: 'None', score: 0, color: 'bg-slate-700', text: 'text-slate-500' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { label: 'Weak', score: 25, color: 'bg-rose-500', text: 'text-rose-400' };
    if (score <= 4) return { label: 'Moderate', score: 60, color: 'bg-amber-500', text: 'text-amber-400' };
    if (score <= 5) return { label: 'Strong', score: 85, color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { label: 'Very Strong', score: 100, color: 'bg-indigo-500', text: 'text-indigo-400' };
  };

  const strength = getStrength();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
              <KeyRound className="w-3.5 h-3.5" /> Project Module 3
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Random Password Generator</h2>
            <p className="text-slate-400 text-sm mt-1">
              Web Crypto API powered generator implementing cryptographic randomness (`crypto.getRandomValues`) with custom entropy controls.
            </p>
          </div>
        </div>

        {/* Validation Error banner */}
        {validationError && (
          <div className="mt-6 flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold text-rose-200">Validation Notice</p>
              <p className="mt-0.5">{validationError}</p>
            </div>
          </div>
        )}

        {/* Password Output Field */}
        <div className="mt-6 p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            readOnly
            value={password || 'Click "Generate Password" to create'}
            className={`w-full bg-transparent font-mono text-lg sm:text-xl font-medium tracking-wide focus:outline-none ${
              password ? 'text-emerald-400 select-all' : 'text-slate-600'
            }`}
          />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition active:scale-95 ${
                copied
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 disabled:opacity-50'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={generatePassword}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95 shadow-md shadow-indigo-600/20"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strength Meter */}
        {password && (
          <div className="mt-4 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Password Entropy Strength:
              </span>
              <span className={`font-semibold uppercase tracking-wider ${strength.text}`}>
                {strength.label}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 transition-all duration-300 rounded-full ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        )}

        {/* Configuration Controls */}
        <div className="mt-8 space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label className="font-semibold text-slate-300">Password Length</label>
              <span className="font-mono font-bold text-indigo-400 text-base">{length} chars</span>
            </div>
            <input
              type="range"
              min="6"
              max="48"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>6 (Minimum)</span>
              <span>16 (Recommended)</span>
              <span>48 (Maximum)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label className="flex items-center gap-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Lowercase Letters</span>
                <span className="text-xs text-slate-500 font-mono">a-z</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Uppercase Letters</span>
                <span className="text-xs text-slate-500 font-mono">A-Z</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Numeric Digits</span>
                <span className="text-xs text-slate-500 font-mono">0-9</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
              />
              <div>
                <span className="text-sm font-medium text-slate-200 block">Special Symbols</span>
                <span className="text-xs text-slate-500 font-mono">!@#$%^&*...</span>
              </div>
            </label>
          </div>

          <button
            onClick={generatePassword}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <KeyRound className="w-5 h-5" /> Generate Password
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-300">Client-Side Cryptographic Security</p>
          Passwords are synthesized directly in your browser's execution thread via Web Crypto API. No generated strings are ever logged, cached on servers, or transmitted across the network.
        </div>
      </div>
    </div>
  );
};
