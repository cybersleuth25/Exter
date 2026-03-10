# ProjectDefense AI 🛡️

AI-powered platform to prepare for hackathons, project defenses, viva exams, and startup pitch evaluations.

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| **Backend**  | Python FastAPI                 |
| **Database** | MongoDB + Motor (async)        |
| **AI**       | Google Gemini 1.5 Flash        |
| **Auth**     | JWT (python-jose + passlib)    |
| **Frontend** | Next.js (React) + Tailwind CSS |
| **PDF**      | ReportLab                      |

## Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** running locally on port 27017

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start server
python -m uvicorn main:app --reload --port 8000
```

API docs at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Features

- **User Authentication** — JWT signup/login
- **Project Submission** — title, problem, description, tech stack, business model, GitHub link
- **AI Analysis** — summary, strengths, weaknesses, scoring
- **4 AI Judge Personalities** — Technical, Investor, Academic, Product
- **Mock Viva Simulator** — interactive Q&A with live AI evaluation
- **Scoring System** — 6 categories scored 0-10
- **PDF Report Generator** — downloadable evaluation report
- **Project History** — past analyses and viva sessions

## Project Structure

```
backend/
├── main.py                # FastAPI entry point
├── database/mongodb.py    # Motor async connection
├── models/                # Pydantic schemas
├── routes/                # API endpoints
│   ├── auth_routes.py
│   ├── project_routes.py
│   ├── analysis_routes.py
│   ├── viva_routes.py
│   └── report_routes.py
└── services/              # Business logic
    ├── ai_engine.py       # Gemini AI integration
    ├── scoring_engine.py
    └── pdf_generator.py

frontend/
├── pages/                 # Next.js pages
│   ├── index.js           # Landing page
│   ├── login.js
│   ├── signup.js
│   ├── dashboard.js
│   ├── submit_project.js
│   ├── analysis_results.js
│   └── viva_simulator.js
├── components/            # Reusable UI
│   ├── Navbar.js
│   ├── ProjectForm.js
│   ├── QuestionCard.js
│   ├── ScoreCard.js
│   └── ReportDownload.js
└── services/api.js        # Axios HTTP client
```

## Environment Variables

| Variable         | Description                                                      |
| ---------------- | ---------------------------------------------------------------- |
| `MONGODB_URL`    | MongoDB connection string (default: `mongodb://localhost:27017`) |
| `DATABASE_NAME`  | Database name (default: `projectdefense_ai`)                     |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens                                    |
| `GEMINI_API_KEY` | Google Gemini API key                                            |
