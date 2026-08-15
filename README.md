# Construction Equipment Allocation System
<img width="1376" height="768" alt="Gemini_Generated_Image_6ilcay6ilcay6ilc" src="https://github.com/user-attachments/assets/029b82d5-9a47-4b24-8ab2-d4ddfd78bfaf" />

A full-stack scheduling application for construction equipment bookings with conflict detection, priority-based displacement, maintenance blocking, and manager override workflows.

The system uses:
- FastAPI + SQLAlchemy + SQLite for the backend
- React + TypeScript + Vite for the frontend
- Google OR-Tools CP-SAT for scheduling/conflict logic

## Features

- JWT login with role-aware authorization
- Equipment booking with priority levels (P1 to P3)
- Automatic displacement of lower-priority overlapping bookings
- Transport-buffer validation between different sites
- Shift-aware scheduling (morning, afternoon, full-day)
- Maintenance windows that block conflicting bookings
- Conflict log and manager override endpoints
- Seeded sample users, sites, and equipment

## Architecture

- Frontend: React app for dashboard, fleet view, booking flow, conflicts, and override actions
- Backend API: FastAPI endpoints for auth, bookings, maintenance, conflicts, and lookup data
- Scheduler engine: OR-Tools-backed decision logic for overlap and displacement
- Persistence: SQLite database accessed through SQLAlchemy ORM

See the detailed documents in the [docs](docs) folder:
- [architecture.md](docs/architecture.md)
- [design.md](docs/design.md)
- [user-guide.md](docs/user-guide.md)

## Tech Stack

- Python, FastAPI, SQLAlchemy, Pydantic
- OR-Tools CP-SAT
- React, TypeScript, Vite, Tailwind CSS
- Docker + Docker Compose (optional local runtime)

## Project Structure

```text
.
|- backend/
|  |- main.py
|  |- api.py
|  |- scheduler.py
|  |- models.py
|  |- tests/
|- frontend/
|  |- src/
|  |- package.json
|- docs/
|- docker-compose.yml
|- README.md
```

## Prerequisites

- Python 3.14+
- Node.js 18+
- npm

## Quick Start (Local)

1. Clone the repository and open it.
2. Set up the backend:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

3. In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Default URLs

- Frontend: http://localhost:5173
- Backend API root: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- API base used by frontend: http://localhost:8000/api

## Seeded Demo Accounts

When `python seed.py` runs (or backend startup seeding executes), these users are created if the database is empty:

- Manager
	- username: manager1
	- password: pass123
- Site engineer
	- username: engineer1
	- password: pass123

## API Overview

Base prefix: `/api`

- `POST /auth/login` - obtain bearer token
- `GET /equipment` - list equipment
- `GET /sites` - list sites
- `GET /bookings` - list bookings (supports filters)
- `POST /bookings` - create booking with conflict checks
- `GET /maintenance` - list maintenance windows
- `POST /maintenance` - create maintenance window (manager only)
- `GET /conflicts` - list displaced bookings
- `PATCH /bookings/{id}/override` - override booking status (manager only)

## Environment Variables

Backend:
- `DATABASE_URL` (optional)
	- default: sqlite:///backend/equipment.db
- `SECRET_KEY` (optional, but set for real deployments)
	- default in code: supersecretkey
- `TRANSPORT_BUFFER_HOURS` (optional)
	- default: 4

Frontend:
- The current API URL is hardcoded to `http://localhost:8000/api` in `frontend/src/lib/api.ts`.

## Running Tests

From `backend/`:

```bash
pytest
```

The test suite covers:
- authentication and role restrictions
- overlap and priority displacement behavior
- transport-buffer constraints
- shift-aware booking logic
- maintenance conflict handling

## Run with Docker (Optional)

From the repository root:

```bash
docker compose up --build
```

Services:
- Backend on port 8000
- Frontend on port 5173

## Notes and Limitations

- SQLite is used for simplicity and assessment portability.
- Default secrets are for local development only.
- Frontend currently assumes a local backend URL.

## Assessment Artifacts

- Change log: [change_loop_log.md](change_loop_log.md)
- Documentation index: [docs/README.md](docs/README.md)
- Presentation: [docs/presentation.html](docs/presentation.html)

## License

Provided for assessment/demo use.
