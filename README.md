# CodeTalk — Voice-Based Technical Interview Simulator

> Built for the **AssemblyAI Voice Agent Hackathon** (Deadline: September 30, 2026).

CodeTalk is a real-time voice-interactive mock technical interview platform. Candidates speak their algorithmic reasoning out loud, get transcribed in real time via AssemblyAI Universal Streaming, and receive instant follow-up questions, efficiency audits, and comprehensive scorecards from an AI interviewer.

---

## 🌐 Live Deployments & Links

* **Live Unified Web App**: [https://frontend-snowy-one-12.vercel.app](https://frontend-snowy-one-12.vercel.app)
* **Live Backend API**: [https://backend-peach-eight-70.vercel.app](https://backend-peach-eight-70.vercel.app)
* **Interactive Swagger Docs**: [https://backend-peach-eight-70.vercel.app/docs](https://backend-peach-eight-70.vercel.app/docs)
* **GitHub Repository**: [https://github.com/Aniket12-coder07/codetalk](https://github.com/Aniket12-coder07/codetalk)

---

## 🚀 Features

1. **Real-Time Speech-to-Text**: Powered by AssemblyAI Universal Streaming API (v3) with low-latency audio chunking.
2. **AI Technical Interviewer**: LangChain + Claude reasoning engine that analyzes verbal problem-solving and asks targeted follow-up questions.
3. **Monaco Code Editor**: Multi-language support for **Python**, **JavaScript**, **TypeScript**, **Java**, **C++**, and **Go**.
4. **60 Industry DSA Problems**: Exactly 20 Easy, 20 Medium, and 20 Hard questions loaded with constraints, Big-O targets, and multi-language starter code.
5. **Strict 0–5 Scoring Penalty**: Submitting unattempted code (empty/boilerplate stubs) or stating "I don't know" strictly awards 0–5 out of 100 across all difficulties.
6. **Neobrutalist UI with Dark/Light Mode**: High-contrast, dynamic component set with audio waveforms, live speech simulator, and performance scorecards.

---

## 💻 Running Locally

### 1. Backend (FastAPI + Python)
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## 📁 Project Structure

```text
CodeTalk/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI endpoints & WebSocket server
│   │   ├── transcriber.py     # AssemblyAI streaming audio bridge
│   │   └── interviewer.py     # AI evaluator, Big-O audit & 0-5 scoring
│   ├── data/
│   │   └── questions.json     # 60 LeetCode-style industry problems
│   ├── scripts/
│   │   └── test_interviewer.py # Standalone verification tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Neobrutalist UI components
│   │   ├── data/              # 60 questions synced for instant UI preview
│   │   ├── App.tsx            # Main interview dashboard
│   │   └── index.css          # Tailwind + Neobrutalism theme
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json            # Unified reverse-proxy rewrite rules
└── render.yaml                # Free Render.com deployment blueprint
```
