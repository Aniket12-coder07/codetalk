# 🎙️ CodeTalk — Voice-Based Technical Interview Simulator

> **Built for the AssemblyAI Voice Agent Hackathon** (Deadline: Sep 30, 2026)

CodeTalk is an interactive mock technical interview platform where candidates explain their Data Structures & Algorithms (DSA) thought process out loud. Spoken audio is transcribed in real-time with **AssemblyAI's Universal Streaming API**, evaluated for verbal reasoning and clarity by an AI interviewer powered by **LangChain + Claude**, and paired with live code authoring in a **Monaco Code Editor**.

Styled with a distinctive **Neo-brutalist** aesthetic (chunky borders, bold drop shadows, category color tabs, cream canvas), CodeTalk replicates the experience of a real Senior Software Engineer probing your thought process.

---

## ⚡ Core Features

- **Real-Time Speech-to-Text**: Low-latency streaming transcription using AssemblyAI's Universal Streaming WebSocket API (`RealtimeTranscriber`).
- **Verbal Reasoning Critique**: LangChain + Anthropic Claude (Claude 3.5 Sonnet) evaluates candidate communication, time/space complexity awareness, and edge-case identification.
- **Dynamic Interviewer Follow-ups**: Proactive, contextual follow-up questions tailored to what you just spoke (e.g., *"What if the array has duplicates?"*, *"How does your sliding window handle empty strings?"*).
- **Interactive Code Editor**: Embedded Monaco Editor with syntax highlighting, language templates, and code analysis.
- **Holistic Code & Speech Review**: Evaluates final submitted code against the verbal explanation to grade alignment, code quality, and efficiency.
- **Comprehensive Session Report**: End-of-session scorecard with rubric breakdowns and actionable feedback.
- **Neo-Brutalist Design**: High-contrast, bold flat UI with cream background (`#F5F1E8`), 3-4px black borders, solid offset drop shadows, and vibrant accent tabs.

---

## 🏗️ Architecture

```
                                  ┌───────────────────────────────┐
                                  │   AssemblyAI Streaming API    │
                                  │  (Universal-Streaming WSS)    │
                                  └──────────────▲────────────────┘
                                                 │
                               Audio Chunks (PCM)│ Transcripts
                                                 │
┌──────────────────────┐    WebSocket     ┌──────▼────────────────────────┐
│  React Frontend      ├─────────────────►│  FastAPI Backend              │
│  - Web Audio PCM Mic │◄─────────────────┤  - WebSocket Audio Bridge     │
│  - Monaco Editor     │   Live Text &    │  - Session Orchestration      │
│  - Neobrutalist UI   │   Follow-ups     └──────────────┬────────────────┘
└──────────────────────┘                                 │
                                                         │ Prompts & Code
                                                         │
                                                  ┌──────▼────────────────┐
                                                  │ LangChain + Claude    │
                                                  │ (Anthropic API)       │
                                                  └───────────────────────┘
```

---

## 📁 Repository Layout

```text
codetalk/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & WebSocket audio bridge
│   │   ├── interviewer.py       # LangChain + Claude interview engine
│   │   └── transcriber.py       # AssemblyAI RealtimeTranscriber wrapper
│   ├── scripts/
│   │   ├── test_streaming.py    # Standalone AssemblyAI streaming test
│   │   └── test_interviewer.py  # Standalone LangChain + Claude test
│   ├── data/
│   │   └── questions.json       # Curated DSA problem bank with rubrics
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Template for API credentials
│   └── .env                     # Local environment file (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/ui/       # Neobrutalist buttons, cards, tabs, badges
│   │   ├── components/          # MicButton, Transcript, MonacoEditor, FeedbackPanel
│   │   ├── data/questions.json  # DSA problems & starter code
│   │   ├── App.tsx              # Main interview container
│   │   └── index.css            # Neobrutalist design tokens & styling
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- AssemblyAI API Key ([Get one here](https://www.assemblyai.com))
- Anthropic API Key ([Get one here](https://console.anthropic.com))

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in ASSEMBLYAI_API_KEY and ANTHROPIC_API_KEY in backend/.env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to start your mock interview.

---

## 🧪 Standalone Verification

- **Step 2 (AssemblyAI STT)**:
  ```bash
  python backend/scripts/test_streaming.py
  ```
- **Step 3 (Claude Interviewer)**:
  ```bash
  python backend/scripts/test_interviewer.py
  ```

---

## 📄 License
MIT License. Built for the AssemblyAI Voice Agent Hackathon 2026.
