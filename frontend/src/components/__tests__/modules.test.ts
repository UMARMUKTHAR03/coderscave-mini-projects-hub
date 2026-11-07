import { describe, it, expect } from 'vitest';

// Test calculator logic
function evaluateSafeExpression(expr: string): number {
  const cleaned = expr.replace(/\s+/g, '');
  if (!cleaned) return 0;
  if (/[^0-9+\-*/.]/.test(cleaned)) throw new Error('Invalid characters');

  const tokens: (number | string)[] = [];
  let numBuffer = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if ('+-*/'.includes(char)) {
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
  if (numBuffer) tokens.push(parseFloat(numBuffer));
  if (tokens.length === 0) return 0;

  // Pass 1: Multiplication and Division
  const pass1Tokens: (number | string)[] = [];
  let idx = 0;
  while (idx < tokens.length) {
    const token = tokens[idx];
    if (token === '*' || token === '/') {
      const prev = pass1Tokens.pop();
      const next = tokens[idx + 1];
      if (typeof prev !== 'number' || typeof next !== 'number') throw new Error('Malformed expression');
      if (token === '/' && next === 0) throw new Error('Cannot divide by zero');
      const res = token === '*' ? prev * next : prev / next;
      pass1Tokens.push(res);
      idx += 2;
    } else {
      pass1Tokens.push(token);
      idx++;
    }
  }

  // Pass 2: Addition and Subtraction
  let result = typeof pass1Tokens[0] === 'number' ? pass1Tokens[0] : 0;
  let opIndex = 1;
  while (opIndex < pass1Tokens.length) {
    const op = pass1Tokens[opIndex];
    const nextNum = pass1Tokens[opIndex + 1];
    if (typeof nextNum !== 'number') throw new Error('Malformed expression');
    if (op === '+') result += nextNum;
    else if (op === '-') result -= nextNum;
    opIndex += 2;
  }

  return Math.round(result * 100000000) / 100000000;
}

// Test typing speed logic
function calculateTypingMetrics(typed: string, prompt: string, elapsedSecs: number) {
  let errors = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== prompt[i]) errors++;
  }
  const accuracy = typed.length > 0
    ? Math.max(0, Math.min(100, Math.round(((typed.length - errors) / typed.length) * 100)))
    : 100;
  const wpm = Math.max(0, Math.round((typed.length / 5) / (Math.max(elapsedSecs, 1) / 60)));
  return { errors, accuracy, wpm };
}

// Test password generator logic
function generateCryptoPassword(length: number, options: { lowercase: boolean; uppercase: boolean; numbers: boolean; symbols: boolean }) {
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMS = '0123456789';
  const SYMS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let pool = '';
  if (options.lowercase) pool += LOWER;
  if (options.uppercase) pool += UPPER;
  if (options.numbers) pool += NUMS;
  if (options.symbols) pool += SYMS;

  if (!pool) throw new Error('Empty character pool');
  if (length < 4 || length > 64) throw new Error('Invalid length');

  let res = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    res += pool[idx];
  }
  return res;
}

describe('Calculator Evaluation Engine', () => {
  it('correctly calculates basic addition and subtraction', () => {
    expect(evaluateSafeExpression('12 + 8')).toBe(20);
    expect(evaluateSafeExpression('50 - 15')).toBe(35);
  });

  it('respects operator precedence (* and / over + and -)', () => {
    expect(evaluateSafeExpression('2 + 3 * 4')).toBe(14);
    expect(evaluateSafeExpression('20 - 10 / 2')).toBe(15);
  });

  it('handles negative numbers correctly', () => {
    expect(evaluateSafeExpression('-5 + 10')).toBe(5);
    expect(evaluateSafeExpression('10 * -2')).toBe(-20);
  });

  it('throws an error on divide by zero', () => {
    expect(() => evaluateSafeExpression('42 / 0')).toThrow('Cannot divide by zero');
  });

  it('throws an error on malicious or invalid expressions', () => {
    expect(() => evaluateSafeExpression('alert(1)')).toThrow();
    expect(() => evaluateSafeExpression('2 +* 3')).toThrow();
  });
});

describe('Typing Speed & Accuracy Calculation', () => {
  const samplePrompt = "The quick brown fox jumps over the lazy dog.";

  it('calculates 100% accuracy when typed correctly', () => {
    const metrics = calculateTypingMetrics(samplePrompt, samplePrompt, 30);
    expect(metrics.errors).toBe(0);
    expect(metrics.accuracy).toBe(100);
    expect(metrics.wpm).toBeGreaterThan(0);
  });

  it('detects errors and adjusts accuracy', () => {
    const faultyTyped = "The qu1ck br0wn fox";
    const metrics = calculateTypingMetrics(faultyTyped, samplePrompt, 10);
    expect(metrics.errors).toBe(2);
    expect(metrics.accuracy).toBeLessThan(100);
  });
});

describe('Password Generator Constraints', () => {
  it('generates passwords of the exact specified length', () => {
    const pwd = generateCryptoPassword(16, { lowercase: true, uppercase: true, numbers: true, symbols: true });
    expect(pwd.length).toBe(16);
  });

  it('throws an error if no character pools are selected', () => {
    expect(() => generateCryptoPassword(12, { lowercase: false, uppercase: false, numbers: false, symbols: false })).toThrow('Empty character pool');
  });

  it('throws an error if length is out of acceptable bounds', () => {
    expect(() => generateCryptoPassword(2, { lowercase: true, uppercase: true, numbers: true, symbols: true })).toThrow('Invalid length');
  });
});

