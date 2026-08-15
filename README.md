# Construction Equipment Allocation System

FastAPI + SQLAlchemy + SQLite backend, React + TypeScript frontend, and OR-Tools based conflict resolution for construction equipment bookings.

## Prerequisites
- Python 3.14+
- Node.js 18+
- npm

## Local Setup
1. Create and activate a Python virtual environment in `backend/`.
2. Install backend dependencies:
	`pip install -r requirements.txt`
3. Copy [.env.example](.env.example) to `.env` and adjust values if needed.
4. Seed the database from `backend/`:
	`python seed.py`
5. Start the backend API from `backend/`:
	`uvicorn main:app --reload`
6. In `frontend/`, install frontend dependencies:
	`npm install`
7. Start the frontend dev server from `frontend/`:
	`npm run dev`

## Default URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Optional Docker Start
If you prefer Docker, run `docker compose up --build` from the repository root.
