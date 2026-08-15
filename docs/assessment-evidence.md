# Assessment Evidence

Date: 2026-08-15

This file maps the Tactive assessment requirements to the current
Construction Equipment Allocation System implementation and command-backed
evidence.

## Deliverable Mapping

- Source code + README/run guide: `backend/`, `frontend/`, `README.md`.
- Tests: `backend/tests/test_api.py`.
- Architecture/design/user docs: `docs/architecture.md`, `docs/design.md`,
  `docs/user-guide.md`, `docs/api-reference.md`.
- AI change-loop evidence: `change_loop_log.md`, `docs/ai-tooling-and-change-loop.md`.
- Deliberate red run: `backend/test_results_red_run.log`.
- Green runs: `backend/test_results_green_run.log`,
  `backend/test_results_shifts_run.log`, `backend/test_results_shifts_attempt2.log`,
  `backend/test_results_shifts_attempt3.log`.
- Presentation: `docs/presentation.html`.

## Verified Commands

Backend syntax check:

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall -q main.py api.py scheduler.py models.py schemas.py auth.py seed.py tests
```

Result: OK, no syntax errors.

Seed:

```powershell
cd backend
.\.venv\Scripts\python.exe seed.py
```

Result: seed completed. Creates demo users (`manager1`, `engineer1`), two
sites, and three pieces of equipment. The seed is idempotent and skips work if
users already exist.

Start the backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Health / root:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/
```

Result: `{"status": "ok", "message": "Equipment Allocation API is running"}`.

Tests:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

Result (current implementation): `17 passed, 13 warnings in 14.30s`.

Frontend build:

```powershell
cd frontend
npm run build
```

Result: TypeScript and Vite production build passed.

## Deliberate Red Run

Requirement: the test suite must be able to fail, and the repo must show at
least one run where a deliberate break was caught.

Captured in `backend/test_results_red_run.log`:

```text
1 failed, 8 passed, 17 warnings in 15.06s
FAILED tests/test_api.py::test_back_to_back_booking - assert 409 == 200
```

What happened:

- The overlap check was deliberately changed so that a booking starting
  exactly when the previous booking ends was treated as overlapping.
- The `test_back_to_back_booking` test expects back-to-back bookings at the
  same site to succeed (transport buffer 0 at the same site).
- The suite correctly caught the regression with a `409 Conflict`.
- The overlap logic was restored and the full suite passed again.

Why this matters: it proves the tests are not vacuous. A behavioral regression
in the scheduling logic produces a real failure, not a pass-by-default suite.

## Green Runs

Final current state:

```text
17 passed, 13 warnings in 14.30s
```

Change-loop green runs, captured in order:

- `test_results_shifts_run.log`: 11 passed (shift field added).
- `test_results_shifts_attempt2.log`: 15 passed (shift-aware maintenance and transport buffer).
- `test_results_shifts_attempt3.log`: 17 passed (full_day vs half-day maintenance).
- `test_results_green_run.log`: 17 passed (final verification).

## AI Change Loop Notes

Requested change (from `change_loop_log.md`):

- Add shift-based (half-day) bookings: `morning`, `afternoon`, `full_day`.
- Make same-day bookings non-conflicting when shifts do not overlap.
- Apply maintenance and transport buffers at shift granularity.
- Add tests covering non-overlapping shifts, overlapping shifts, transport
  buffer at shift granularity, and full_day vs half-day maintenance.

Failures found and fixed:

- No in-loop failures for the shift feature itself; each attempt passed on its
  first run.
- The only schema change required manual intervention: the SQLite database was
  deleted and reseeded because the repository does not include an automated
  migration tool.
- The genuine failure-and-fix evidence is the deliberate red run in Stage 2,
  where the suite caught an intentionally introduced overlap-check bug.

## Remaining Assessment Items

- Record a 5-minute demo video (2 min problem/approach, 3 min live demo).
- Presentation deck exists as HTML; a PPT/PDF export can be generated if
  required by the submission.
- Optional future work: CI pipeline, Playwright end-to-end browser tests, and
  an automated database migration path.