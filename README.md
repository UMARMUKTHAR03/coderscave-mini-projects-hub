# CodersCave Mini Projects Hub

[![CI / CD Pipeline](https://github.com/UMARMUKTHAR03/coderscave-mini-projects-hub/actions/workflows/ci.yml/badge.svg)](https://github.com/UMARMUKTHAR03/coderscave-mini-projects-hub/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

**CodersCave Mini Projects Hub** is a unified, responsive full-stack web platform combining four independent Python internship mini-projects into modern, interactive web modules.

---

## 🌟 Original Projects Heritage

This platform preserves and elevates the functionality of four original Python Tkinter desktop applications developed during the CodersCave internship:

| # | Project Name | Original Repository | Original Stack | Modernized Full-Stack Web Module |
|---|---|---|---|---|
| 1 | **Voice Recorder** | [UMARMUKTHAR03/Voice-Recoder](https://github.com/UMARMUKTHAR03/Voice-Recoder) | Python Tkinter, `sounddevice`, `scipy.io.wavfile` | Browser MediaRecorder API, Web Audio API waveform visualizer, client memory processing, WAV/WebM direct download |
| 2 | **Typing Speed Tester** | [UMARMUKTHAR03/Typing-Speed-Tester](https://github.com/UMARMUKTHAR03/Typing-Speed-Tester) | Python Tkinter, `ttk`, `time` | Interactive sentence tests, real-time WPM, accuracy %, character error highlight, persistent SQLite logs via FastAPI |
| 3 | **Random Password Generator** | [UMARMUKTHAR03/Random-Password-Generator](https://github.com/UMARMUKTHAR03/Random-Password-Generator) | Python Tkinter, `random`, `string` | Web Crypto API (`crypto.getRandomValues`), entropy strength gauge, custom character sets, zero server transmission |
| 4 | **Calculator** | [UMARMUKTHAR03/Calculator](https://github.com/UMARMUKTHAR03/Calculator) | Python Tkinter, `eval()` | Safe 2-pass lexical arithmetic parser (no unsafe `eval`), keyboard event bindings, history tape, divide-by-zero protection |

---

## 🚀 Key Modules & Capabilities

### 1. Unified Dashboard
- Professional CodersCave branding with dark-mode aesthetic.
- Interactive project showcase cards with feature pills and direct launcher actions.
- Real-time API connection health monitor pill (Online vs. Local Offline Fallback Mode).
- Fully responsive layout tailored for mobile, tablet, and desktop viewports.

### 2. Voice Recorder
- **Local Browser Capture:** Uses `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
- **Live Waveform Display:** Renders real-time audio time-domain oscillations on HTML5 Canvas via `AudioContext` and `AnalyserNode`.
- **Session Controls:** Start, pause, resume, and stop recording with dynamic timer.
- **Client Privacy:** Audio is processed entirely in browser memory; no user audio is ever transmitted to the server.
- **Export Options:** Download captures as `.webm` or `.wav`.

### 3. Typing Speed Tester
- **Real-Time Calculation:** Computes Gross Words Per Minute (WPM), typing accuracy percentage, and mistake counts dynamically as the user types.
- **Visual Feedback:** Color-coded prompt feedback highlighting correct keystrokes, active position, and errors.
- **SQLite Persistence:** Submits completion statistics (`wpm`, `accuracy`, `duration_seconds`, `error_percentage`) to FastAPI.
- **Aggregate Statistics:** Displays total sessions completed, personal best WPM, and average accuracy with offline `localStorage` fallback.

### 4. Random Password Generator
- **Cryptographic Randomness:** Employs `window.crypto.getRandomValues` to ensure entropy that resists predictable PRNG attacks.
- **Granular Controls:** Selectable length (6–48 characters) and toggles for lowercase, uppercase, numeric digits, and special symbols.
- **Strength Evaluation:** Multi-factor entropy scoring measuring length, diversity, and pattern complexity.
- **Confidentiality:** Passwords are generated and held strictly on the client; never persisted or transmitted.

### 5. Calculator
- **Safe Parsing Engine:** Implements a token-based two-pass arithmetic evaluator (`*` and `/` evaluated before `+` and `-`).
- **Zero `eval()` Risks:** Eliminates JavaScript code injection vulnerabilities.
- **Hardware Keyboard Support:** Listens to `0-9`, operators, `Enter` / `=`, `Backspace`, and `Escape`.
- **Robust Error Handling:** Detects malformed syntax and gracefully handles division by zero.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite 6, TypeScript 5.6
- **Styling:** Tailwind CSS 3.4, Lucide React icons
- **Backend:** FastAPI, Uvicorn, Pydantic v2
- **Database:** SQLite3
- **Testing:** Pytest (Backend), Vitest (Frontend)
- **CI/CD:** GitHub Actions (Python 3.11 + Node.js 20 test & build matrix)
- **Deployment Targets:** GitHub Pages (Frontend SPA), Render (FastAPI Web Service)

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Browser Client                       │
│             (React 18 + Vite + Tailwind)               │
├───────────────────┬────────────────────────────────────┤
│ Voice Recorder    │ Web Audio API & MediaRecorder      │
│ Password Gen      │ Web Crypto API (getRandomValues)   │
│ Calculator        │ Safe 2-Pass Arithmetic Parser      │
│ Typing Tester     │ Live WPM / Accuracy Engine         │
└─────────┬─────────┴──────────────────┬─────────────────┘
          │ (Optional Metrics Sync)    │ (Offline Fallback)
          ▼                            ▼
┌─────────────────────────┐   ┌──────────────────────────┐
│      FastAPI API        │   │   Browser LocalStorage   │
│ (Render Python Service) │   │ (Zero-Disruption Cache)  │
└───────────┬─────────────┘   └──────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│     SQLite Database     │
│  (Session Analytics)    │
└─────────────────────────┘
```

---

## 📡 Backend API Reference

Base URL: `http://127.0.0.1:8000` (Local) / Configured Render URL (Production)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status, version, and server timestamp |
| `GET` | `/api/typing/history?limit=50` | Retrieve recent typing session history records |
| `POST` | `/api/typing/sessions` | Store a newly completed typing test performance record |
| `GET` | `/api/typing/statistics` | Fetch aggregate metrics (avg WPM, personal best, total tests) |

---

## 🧪 Automated Testing

### Backend Unit Tests (Pytest)
```bash
cd backend
python -m pytest tests/ -v
```
**Results:** `5 passed` across root status, health check, typing session persistence, aggregate statistics calculation, and schema validation.

### Frontend Unit Tests (Vitest)
```bash
cd frontend
npm test
```
**Results:** `10 passed` (Calculator precedence, negative numbers, divide by zero, typing metrics, password entropy rules).

### Production Build
```bash
cd frontend
npm run build
```
**Results:** Successfully compiles clean production bundle with zero TypeScript warnings or errors.

---

## 🚢 Deployment Architecture & Details

### Frontend Deployment (GitHub Pages)
- **Live URL:** [https://umarmukthar03.github.io/coderscave-mini-projects-hub/](https://umarmukthar03.github.io/coderscave-mini-projects-hub/)
- **Workflow:** Deployed automatically on every push to `main` via `.github/workflows/ci.yml`.
- **Packaging:** Standalone SPA built with relative base paths (`./`) and an included `public/404.html` fallback to ensure deep routes and browser refresh work reliably without client routing breakage.

### Backend Deployment (Render Free Web Service)
- **Target URL:** [https://coderscave-mini-projects-hub-api.onrender.com](https://coderscave-mini-projects-hub-api.onrender.com)
- **Specification:** Preconfigured via `render.yaml` Blueprint using Python 3.11.9, ASGI uvicorn runner, and production CORS restricted to the deployed GitHub Pages origin.

> **Important Storage & Persistence Disclosure (Render Free Plan):**
> - The backend utilizes SQLite located under `DATA_DIR` (`/opt/render/project/src/data/coderscave_hub.db`).
> - Render Free instances do not include persistent disks and operate on an ephemeral filesystem.
> - As a result, server-side SQLite typing test records and history will reset when the instance restarts, redeploys, or sleeps after inactivity.
> - **Client-Side Resilience:** The frontend includes an automatic `localStorage` fallback layer (`LOCAL_STORAGE_SESSIONS_KEY`), ensuring all typing scores and statistics remain accessible and functional even during cold starts or service reboots.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

**Author:** [Umar Mukthar](https://github.com/UMARMUKTHAR03)

