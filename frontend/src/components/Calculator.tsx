import React, { useState, useEffect, useCallback } from 'react';
import { Calculator as CalcIcon, Delete } from 'lucide-react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [previousExpr, setPreviousExpr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Safe arithmetic parser replacing unsafe JavaScript eval()
  const evaluateSafeExpression = (expr: string): number => {
    // Clean and validate tokens
    const cleaned = expr.replace(/\s+/g, '');
    if (!cleaned) return 0;

    // Check for invalid characters
    if (/[^0-9+\-*/.]/.test(cleaned)) {
      throw new Error('Invalid characters in expression');
    }

    // Tokenize numbers and operators
    const tokens: (number | string)[] = [];
    let numBuffer = '';

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if ('+-*/'.includes(char)) {
        // Handle negative numbers at the beginning or after an operator
        if (char === '-' && (i === 0 || '+-*/'.includes(cleaned[i - 1]))) {
          numBuffer += '-';
        } else {
          if (numBuffer) {
            tokens.push(parseFloat(numBuffer));
            numBuffer = '';
          }
          tokens.push(char);
        }
      } else {
        numBuffer += char;
      }
    }
    if (numBuffer) {
      tokens.push(parseFloat(numBuffer));
    }

    if (tokens.length === 0) return 0;

    // Pass 1: Multiplication and Division
    const pass1Tokens: (number | string)[] = [];
    let idx = 0;
    while (idx < tokens.length) {
      const token = tokens[idx];
      if (token === '*' || token === '/') {
        const prev = pass1Tokens.pop();
        const next = tokens[idx + 1];
        if (typeof prev !== 'number' || typeof next !== 'number') {
          throw new Error('Malformed expression');
        }
        if (token === '/' && next === 0) {
          throw new Error('Cannot divide by zero');
        }
        const res = token === '*' ? prev * next : prev / next;
        pass1Tokens.push(res);
        idx += 2;
      } else {
        pass1Tokens.push(token);
        idx++;
      }
    }

    // Pass 2: Addition and Subtraction
    if (pass1Tokens.length === 0) return 0;
    let result = typeof pass1Tokens[0] === 'number' ? pass1Tokens[0] : 0;
    let opIndex = 1;

    while (opIndex < pass1Tokens.length) {
      const op = pass1Tokens[opIndex];
      const nextNum = pass1Tokens[opIndex + 1];
      if (typeof nextNum !== 'number') {
        throw new Error('Malformed expression');
      }
      if (op === '+') {
        result += nextNum;
      } else if (op === '-') {
        result -= nextNum;
      }
      opIndex += 2;
    }

    if (!isFinite(result)) {
      throw new Error('Numeric overflow or divide by zero');
    }

    return Math.round(result * 100000000) / 100000000;
  };

  const handleButtonClick = useCallback((val: string) => {
    setError(null);

    if (val === 'C') {
      setDisplay('0');
      setPreviousExpr('');
      return;
    }

    if (val === 'DEL') {
      if (display.length <= 1 || display === 'Error') {
        setDisplay('0');
      } else {
        setDisplay(display.slice(0, -1));
      }
      return;
    }

    if (val === '=') {
      try {
        const res = evaluateSafeExpression(display);
        setPreviousExpr(`${display} =`);
        setDisplay(String(res));
      } catch (err: any) {
        setError(err.message || 'Calculation error');
        setPreviousExpr(display);
        setDisplay('Error');
      }
      return;
    }

    // Append digit or operator
    if (display === '0' || display === 'Error') {
      if ('+-*/'.includes(val)) {
        setDisplay('0' + val);
      } else {
        setDisplay(val);
      }
    } else {
      const lastChar = display[display.length - 1];
      if ('+-*/'.includes(lastChar) && '+-*/'.includes(val)) {
        // Replace operator with new one
        setDisplay(display.slice(0, -1) + val);
      } else {
        setDisplay(display + val);
      }
    }
  }, [display]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        handleButtonClick(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        handleButtonClick(key);
      } else if (key === '.' || key === ',') {
        handleButtonClick('.');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleButtonClick('=');
      } else if (key === 'Backspace') {
        handleButtonClick('DEL');
      } else if (key === 'Escape') {
        handleButtonClick('C');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick]);

  const calcButtons = [
    { label: 'C', val: 'C', type: 'fn' },
    { label: 'DEL', val: 'DEL', type: 'fn' },
    { label: '/', val: '/', type: 'op' },
    { label: '*', val: '*', type: 'op' },

    { label: '7', val: '7', type: 'num' },
    { label: '8', val: '8', type: 'num' },
    { label: '9', val: '9', type: 'num' },
    { label: '-', val: '-', type: 'op' },

    { label: '4', val: '4', type: 'num' },
    { label: '5', val: '5', type: 'num' },
    { label: '6', val: '6', type: 'num' },
    { label: '+', val: '+', type: 'op' },

    { label: '1', val: '1', type: 'num' },
    { label: '2', val: '2', type: 'num' },
    { label: '3', val: '3', type: 'num' },
    { label: '=', val: '=', type: 'eq' },

    { label: '0', val: '0', type: 'num', wide: true },
    { label: '.', val: '.', type: 'num' },
  ];

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <CalcIcon className="w-3.5 h-3.5" /> Project Module 4
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Calculator</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Keyboard Ready</span>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 text-right font-mono mb-5 shadow-inner">
          <div className="text-xs text-slate-500 h-5 overflow-hidden text-ellipsis whitespace-nowrap">
            {previousExpr}
          </div>
          <div className={`text-3xl sm:text-4xl font-bold tracking-tight overflow-x-auto whitespace-nowrap scrollbar-none py-1 ${
            display === 'Error' ? 'text-rose-400' : 'text-white'
          }`}>
            {display}
          </div>
          {error && (
            <p className="text-xs text-rose-400 mt-1">{error}</p>
          )}
        </div>

        {/* Button Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {calcButtons.map((btn, idx) => {
            let style = 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80';
            if (btn.type === 'op') {
              style = 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30';
            } else if (btn.type === 'fn') {
              style = 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30';
            } else if (btn.type === 'eq') {
              style = 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold row-span-2 border border-indigo-500 shadow-lg shadow-indigo-600/30';
            }

            return (
              <button
                key={idx}
                onClick={() => handleButtonClick(btn.val)}
                className={`py-3.5 sm:py-4 rounded-xl font-mono text-lg font-medium transition active:scale-95 flex items-center justify-center ${
                  btn.wide ? 'col-span-2' : ''
                } ${style}`}
              >
                {btn.val === 'DEL' ? <Delete className="w-5 h-5" /> : btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety & Features Note */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400">
        <p className="font-semibold text-slate-300 mb-1">Safe Evaluation Engine</p>
        Calculations are solved through an operator precedence lexical parser. No unsafe `eval()` expressions are used, safeguarding against injection attacks. Full hardware keyboard input supported.
      </div>
    </div>
  );
};
