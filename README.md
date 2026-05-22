# ThreatLens 🔍

**Autonomous Continuous Security Validation (CSV) Engine**

ThreatLens is a modern, full-stack security engineering platform that moves beyond generic vulnerability scanners. It acts as a "Virtual Security Engineer"—mapping your attack surface into a centralized Knowledge Graph, validating complex logic flaws like IDOR, and utilizing AI to write production-ready mitigation code.

---

## 🏗️ Architecture

- **Backend:** Python, FastAPI, Prisma ORM (SQLite)
- **Frontend:** Next.js 16 (Turbopack), Tailwind CSS, React Force Graph
- **Intelligence Engine:** Asynchronous Python subprocesses orchestrating Playwright (headless browser analysis) and `httpx` logic validation.
- **AI Remediation:** Google Gemini API

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- `subfinder` (Optional, used for Deep Discovery)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ThreatLens.git
cd ThreatLens
```

### 2. Backend Setup
The backend requires Python and Prisma.

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Setup Database
prisma db push
prisma generate
```

### 3. Frontend Setup
The frontend is a Next.js application.

```bash
cd frontend
npm install
```

### 4. Environment Variables
You need a Google Gemini API key to run the AI Auto-Mitigation engine.

1. Create a `.env` file inside the `backend/` directory:
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

---

## ⚙️ Running the Platform

You need to run both the frontend and backend servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --port 8000 --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Core Features

1. **Many-to-Many Graph Deduplication:** Eliminates noise by mapping multiple affected assets to a single root vulnerability report.
2. **Deep JS Recon:** Uses headless browsers and Regex to parse compiled JavaScript bundles for leaked Cloud Keys and sensitive developer comments.
3. **Logic Pentester Module:** Intercepts tokens to execute state-comparison IDOR (Broken Object Level Authorization) attacks, saving cryptographic HTTP evidence to the database.
4. **Autonomous AI Remediation:** Ingests the contextual Attack Path from the Graph and synthesizes pure Node.js/Nginx patches to fix the flaw instantly.