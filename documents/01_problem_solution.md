# Problem And Solution

## Assessment Context

The assessment brief asks for a small but real working web application, not a
static mockup. It also asks for AI-generated tests, a red/green loop, an
AI-assisted change loop, clear documentation, and a short demo.

The Construction Equipment Allocation System uses the equipment booking and
conflict-resolution scenario because it has real rules, edge cases, priority
boundaries, and measurable outcomes:

- Equipment cannot be double-booked.
- Lower-priority bookings can be displaced by higher-priority demand.
- Equipment takes time to move between sites (transport buffer).
- Maintenance windows block unsafe bookings.
- Half-day (shift-based) bookings can coexist when their shifts do not overlap.

## The Problem

Construction sites often share a small pool of expensive equipment across many
jobs. Without a scheduling system, teams:

- Double-book machines by mistake.
- Lose lower-priority work to higher-priority demand with no record.
- Underestimate travel time between sites.
- Book equipment that is in maintenance.
- Have no audit trail of why a booking was accepted, displaced, or rejected.

## The Solution

The system provides a connected full-stack app where a user can:

- Log in as a site engineer or a manager.
- View equipment availability on a fleet page.
- Create bookings with a priority level and an optional shift.
- Let the scheduler resolve conflicts automatically using priority rules.
- See displaced bookings in a conflict log.
- Schedule maintenance windows that block conflicting bookings.
- Override booking decisions when a manager approves an exception.
- Review utilization and activity on a dashboard.

## Why This Is Better

The system is better than a shallow CRUD demo because:

- Conflict resolution is a real optimization problem solved with Google
  OR-Tools CP-SAT, not hardcoded if-statements.
- Booking decisions are traceable: displacement writes a resolution note.
- Shift-aware scheduling reflects how construction sites actually work.
- Maintenance and transport constraints prevent impossible schedules.
- Auth and RBAC separate engineer actions from manager actions.

## Scope

Implemented scope:

- React + Vite frontend.
- FastAPI backend.
- SQLAlchemy + SQLite persistence.
- JWT authentication with bcrypt password hashing.
- OR-Tools CP-SAT scheduler.
- Seeded demo data.
- Backend pytest suite (17 tests).
- Red/green evidence loop.
- Documentation pack.

Out of scope for this local assessment pass:

- Production hosting.
- Full Playwright end-to-end browser suite.
- Recorded MP4 demo file.
- Automated database migrations.