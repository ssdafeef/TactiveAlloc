# Testing, AI Loop, And Robustness

## What The Assessment Requires

The Tactive assessment asks for:

- Test automation.
- Normal path, edge cases, and invalid input coverage.
- At least one red run where a deliberate break is caught.
- A green run after correction.
- Evidence of AI-assisted implementation, failure diagnosis, and fixes.
- Honesty about what worked and what did not.

## Current Test Command

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest -q
```

Current result:

```text
17 passed, 13 warnings in 14.30s
```

## Test Coverage

The suite in `backend/tests/test_api.py` covers:

- Authentication: unauthenticated access is rejected (401).
- Role restrictions: a site engineer cannot create maintenance (403).
- Successful booking creation.
- Priority displacement: a P1 booking displaces an overlapping P3 booking.
- Same-priority overlap is rejected (409).
- Booking during maintenance is rejected (409).
- Transport-buffer violation across sites is rejected (409).
- Invalid input: end date before start date (400), missing equipment (404).
- Back-to-back bookings at the same site succeed.
- Non-overlapping shifts (morning + afternoon) succeed.
- Overlapping shifts (full_day + morning) fail.
- Transport buffer at shift granularity (violation and satisfied cases).
- Shift-aware maintenance: allowed and conflict cases.
- Full-day booking blocked by morning and by afternoon maintenance.

## Captured Evidence

- `backend/test_results_red_run.log` - deliberate red run.
- `backend/test_results_green_run.log` - final green verification.
- `backend/test_results_shifts_run.log` - green after adding the shift field.
- `backend/test_results_shifts_attempt2.log` - green after shift-aware
  maintenance and transport buffer.
- `backend/test_results_shifts_attempt3.log` - green after full_day handling.
- `change_loop_log.md` - prompts, changes, failures, and attempts.

## Red Run

The deliberate regression changed the overlap logic so that a booking starting
exactly when a previous booking ends was treated as overlapping.

Captured result:

```text
1 failed, 8 passed, 17 warnings in 15.06s
FAILED tests/test_api.py::test_back_to_back_booking - assert 409 == 200
```

Why this matters:

- The test did not always pass.
- The failure was related to the actual scheduling rule.
- The suite caught a behavioral regression, not just a syntax error.

## Green Run

The overlap logic was restored and the suite was run again.

Captured result:

```text
17 passed, 13 warnings
```

## Change Loop Summary

The shift feature was implemented in three iterative attempts, all green on
their first run:

1. Add `shift` field and shift-aware overlap logic (11 tests).
2. Shift-aware maintenance checks and transport buffer (15 tests).
3. `full_day` treated as contiguous both-shifts window (17 tests).

The genuine failure-and-fix evidence is the deliberate red run in Stage 2,
where the suite caught an intentionally introduced overlap-check bug.

## Robustness Features

- Scheduling logic is deterministic and centralized in `scheduler.py`.
- Tests run against an isolated in-memory SQLite database.
- Password hashing uses bcrypt.
- JWT authentication protects all data routes.
- RBAC dependencies protect manager-only operations.
- Input validation rejects invalid dates and missing equipment.
- Maintenance windows and transport buffers prevent unsafe schedules.
- The seed is idempotent and safe to re-run on startup.

## Known Warnings

`pytest` reports Pydantic V2 deprecation warnings for the class-based
`Config` pattern and the deprecated `.dict()` method, plus a Starlette
`on_event` deprecation warning. These do not fail the suite. A future
maintenance pass should migrate schemas to `ConfigDict` / `from_attributes`
and move startup seeding to a lifespan handler.