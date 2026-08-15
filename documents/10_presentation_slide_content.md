# Presentation Slide Content

Use this as the source content for the deck. Keep each slide visually clean:
title, 3 to 5 bullets, one screenshot or diagram where useful, and the speaker
notes as talking points.

## Slide 1 - Equipment Allocation System

Subtitle:
Construction equipment scheduling with conflict detection and priority-based displacement

On-slide bullets:

- Full-stack web app for construction equipment bookings.
- Priority levels P1 to P3 with automatic displacement of lower-priority work.
- Shift-aware scheduling with morning, afternoon, and full-day windows.
- Maintenance windows and transport buffers prevent unsafe schedules.
- Built and verified with an AI-assisted engineering loop.

Visual:
Dashboard screenshot or a simple fleet-to-booking flow diagram.

Speaker notes:
This is a working scheduling system, not a static interface. Every booking
decision goes through a real scheduler backed by Google OR-Tools CP-SAT.

## Slide 2 - Problem

Title:
Shared Equipment Is Hard To Schedule

On-slide bullets:

- Sites share a small pool of expensive machines.
- Double bookings cause delays and idle crews.
- Lower-priority work is silently lost without a record.
- Equipment takes time to move between sites.
- Maintenance windows are often ignored until something breaks.

Visual:
Simple flow showing disconnected tools: Booking Email, Spreadsheet, Maintenance
Chat, Site Call.

Speaker notes:
The real problem is decision quality: knowing which booking should win, why,
and what happens to the bookings that lose.

## Slide 3 - Solution

Title:
One Connected Booking Workflow

On-slide bullets:

- Login -> Booking -> Scheduler -> Conflict Log -> Override.
- OR-Tools CP-SAT maximizes priority-weighted scheduling.
- Higher-priority bookings displace lower-priority overlaps.
- Displaced bookings keep their record and a resolution note.
- Shift-aware checks let half-days coexist on the same machine.

Visual:
Horizontal workflow diagram: Booking -> Scheduler -> Approved / Displaced / Rejected.

Speaker notes:
A booking is not isolated. It is evaluated against maintenance, travel time,
and every other approved booking on the same machine.

## Slide 4 - Architecture

Title:
Full-Stack Architecture

On-slide bullets:

- Frontend: React, TypeScript, Vite, Tailwind CSS.
- Backend: FastAPI, SQLAlchemy, Pydantic.
- Scheduler: Google OR-Tools CP-SAT.
- Persistence: SQLite through SQLAlchemy ORM.
- Verification: pytest backend tests and Vite production build.

Visual:
Architecture diagram: Browser -> React App -> FastAPI API -> OR-Tools Scheduler
-> SQLAlchemy -> SQLite.

Speaker notes:
The frontend owns the user experience, but business decisions are centralized
in the backend scheduler so they stay deterministic and testable.

## Slide 5 - AI Orchestration

Title:
AI Used As An Engineering Partner

On-slide bullets:

- GitHub Copilot and coding agents implemented, tested, and documented the app.
- The AI loop closed three times for the shift feature with green tests.
- A deliberate red run proved the suite can catch behavioral regressions.
- Every prompt, change, and attempt is logged in the change-loop file.
- Manual intervention was limited to reseeding the SQLite database.

Visual:
Loop diagram: Prompt -> Implement -> Test -> Fail -> Diagnose -> Fix -> Verify -> Document.

Speaker notes:
AI was used the way the assessment asks for: to close a real build-test-fix
loop, with honest evidence of what needed manual help.

## Slide 6 - Security

Title:
Security And Access Controls

On-slide bullets:

- Passwords are hashed with bcrypt, never stored in plaintext.
- JWT tokens expire after 30 minutes.
- Role claims gate manager-only operations on the backend.
- Input validation rejects invalid dates and missing equipment.
- No real secrets are committed to the repository.

Visual:
Role table: Site engineer - bookings. Manager - maintenance and overrides.

Speaker notes:
Access is enforced by the backend dependencies, not just by hiding buttons in
the UI.

## Slide 7 - Robustness

Title:
Evidence That The System Actually Runs

On-slide bullets:

- Backend test suite passed: 17 tests.
- Deliberate red run caught a real overlap-check regression.
- Green run passed after restoring the logic.
- Change-loop attempts verified green: 11, 15, then 17 tests.
- Frontend TypeScript and Vite production build configured.

Visual:
Evidence checklist with file names: test_results_red_run.log,
test_results_green_run.log, change_loop_log.md.

Speaker notes:
The red run matters because it proves the tests are meaningful. I broke the
back-to-back overlap rule, pytest caught it, then I restored it and reran the
suite successfully.

## Slide 8 - Demo

Title:
Live Demo Flow

On-slide bullets:

- Log in as the manager account.
- Open Dashboard and Fleet.
- Create a low-priority booking, then a higher-priority overlap.
- Show the low-priority booking displaced in the Conflict Log.
- Schedule maintenance and show a booking rejected during the window.
- Show morning + afternoon coexisting on the same day.

Visual:
Numbered demo path: Login -> Dashboard -> Booking -> Conflict Log -> Maintenance.

Speaker notes:
This demo shows the system is connected end to end: demand enters, the
scheduler arbitrates, conflicts are surfaced with reasons, and a manager can
intervene.

## Slide 9 - Why It Is Better

Title:
What Makes This Stronger Than A CRUD Demo

On-slide bullets:

- Real scheduling rules and edge cases.
- Optimization-based conflict resolution, not hardcoded if-statements.
- Shift-aware scheduling for half-day bookings.
- Displacement records and resolution notes for auditability.
- Role-aware engineer and manager workflows.

Visual:
Before/after comparison: manual scheduling vs scheduler-driven booking.

Speaker notes:
The value is that booking decisions are explainable. The system does not only
store bookings; it says why a booking won, which booking lost, and what a
manager can do about it.

## Slide 10 - Next Steps

Title:
Roadmap To Make The System Stronger

On-slide bullets:

- Alembic migrations to remove manual database reseeding.
- Scenario simulator to forecast conflict impact.
- Distance-based transport buffer instead of a fixed hour gap.
- Playwright E2E tests for the full workflow.
- CI pipeline for tests, build, lint, and seed check.

Visual:
Roadmap with three phases: Phase 1 - Migrations, Phase 2 - Simulation, Phase 3 - Automation and CI.

Speaker notes:
The strongest next improvement is automation: real migrations, an
end-to-end browser suite, and a CI pipeline that runs the tests on every
change.