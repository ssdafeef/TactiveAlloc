# Demo Script And Presentation Deck

## Five-Minute Demo Script

### 0:00 - 0:45 Problem

Construction sites share a small pool of expensive equipment across many jobs.
Without a scheduling system, teams double-book machines, lose track of
displaced work, underestimate travel time between sites, and book equipment
that is in maintenance.

### 0:45 - 1:30 Approach

The system connects the workflow into one app:

- React frontend for the fleet, booking, conflict, and override screens.
- FastAPI backend for auth, APIs, and scheduling.
- Google OR-Tools CP-SAT for conflict resolution.
- SQLite persistence through SQLAlchemy.
- pytest tests and red/green evidence for correctness.

### 1:30 - 2:00 Solution Summary

The scheduler arbitrates bookings by priority, applies the transport buffer
between sites, respects maintenance windows, and supports shift-aware
half-day bookings. Displaced bookings keep their record and a resolution note.

### 2:00 - 3:00 Live Demo Part 1

1. Start the backend and frontend from the README.
2. Log in as `manager1` / `pass123`.
3. Open the Dashboard and show utilization and activity.
4. Open the Fleet page and show equipment status.

### 3:00 - 4:00 Live Demo Part 2

1. Create a low-priority booking (P3) on an equipment.
2. Create a higher-priority booking (P1) that overlaps it.
3. Show that the P3 booking was displaced.
4. Open the Conflict Log and read the resolution note.

### 4:00 - 4:40 Live Demo Part 3

1. As manager, schedule a maintenance window.
2. Try to book the equipment during maintenance and show the 409 rejection.
3. Show a morning + afternoon pair coexisting on the same day (shift-aware).

### 4:40 - 5:00 Evidence

Show the evidence files:

- Red pytest run caught a deliberate overlap-check regression.
- Green pytest run passed after restoration (17 tests).
- Change-loop log shows three iterative green attempts for the shift feature.

## Presentation Deck Outline

### Slide 1 - Equipment Allocation System

Construction equipment scheduling with conflict detection and priority-based
displacement.

### Slide 2 - Problem

Shared equipment, double bookings, unplanned maintenance, and travel time are
hard to manage manually.

### Slide 3 - Solution

One connected workflow: login -> booking -> scheduler -> conflicts -> override.

### Slide 4 - Architecture

React frontend, FastAPI backend, OR-Tools CP-SAT scheduler, SQLAlchemy +
SQLite, pytest.

### Slide 5 - AI Orchestration

Copilot built and refined features; the change loop closed three times with
green tests; a deliberate red run proved the suite can fail.

### Slide 6 - Security

bcrypt password hashing, JWT auth, RBAC for manager actions, no secrets
committed.

### Slide 7 - Robustness

Red/green test loop, deterministic scheduler, isolated in-memory test DB,
frontend build.

### Slide 8 - Demo

Dashboard, booking creation, priority displacement, conflict log, maintenance
blocking, override.

### Slide 9 - Why It Is Better

Real scheduling rules, shift awareness, explainable displacement, role-aware
workflows.

### Slide 10 - Next Steps

Alembic migrations, scenario simulator, distance-based transport buffer,
Playwright E2E tests, CI pipeline.