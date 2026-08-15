# Unique Features And Roadmap

## Implemented Differentiators

### OR-Tools-Based Conflict Resolution

Booking decisions are not hardcoded if-statements. The scheduler builds a
CP-SAT model that maximizes total priority weight with an incumbency bonus, so
the system preserves existing bookings when priorities tie.

### Shift-Aware Scheduling

Half-day bookings reflect how construction sites actually work:

- morning (08:00-12:00) and afternoon (13:00-17:00) can coexist on the same day.
- `full_day` occupies both shifts and blocks either half-day maintenance.
- The transport buffer is applied as hours between the end of one shift and
  the start of the next.

### Priority Displacement With Audit Trail

When a higher-priority booking displaces a lower-priority one, the displaced
booking keeps its record and receives a resolution note, so the decision trail
is visible in the conflict log.

### Role-Aware Workflows

Site engineers create bookings; managers create maintenance and override
decisions. JWT role claims enforce the separation on the backend, not just in
the UI.

### Evidence-Oriented Engineering

The repo includes:

- A deliberate red-run output.
- Green run output at every change-loop attempt.
- A detailed AI change-loop log.
- A frontend production build configuration.

## Why These Make The App Stronger

- They prove the app is not only UI polish.
- They make scheduling decisions explainable through statuses and resolution
  notes.
- They support the assessment's focus on AI-directed engineering judgment.
- They give the demo a clear story: demand enters, the scheduler arbitrates,
  conflicts are surfaced, and a manager can intervene.

## Future Features To Make The System More Unique

These are the strongest next additions, in priority order:

1. Automated Database Migrations

   Replace `create_all` with Alembic so schema changes do not require manual
   database deletion and reseeding.

2. Scenario Simulator

   Let a manager ask "what if I approve this group of low-priority bookings?"
   and show projected utilization and conflicts.

3. Equipment Downtime Forecasting

   Use maintenance history to predict upcoming availability gaps.

4. Site-to-Site Distance Table

   Replace the fixed transport buffer with real distances and travel times
   per site pair.

5. Conflict Resolution Report

   Export a PDF/CSV report of displacement decisions, reasons, and notes.

6. E2E Browser Tests

   Add Playwright tests for login, booking creation, conflict viewing, and
   manager override.

7. CI Pipeline

   Add GitHub Actions for backend tests, frontend build, lint, and seed check.

8. Push Notifications

   Notify engineers when their booking is displaced or approved.

9. Calendar View

   Add a drag-and-drop Gantt/calendar view of equipment allocation.

10. Real Multi-Tenant Deployment

    Replace SQLite with PostgreSQL and add connection pooling, migrations, and
    HTTPS deployment.