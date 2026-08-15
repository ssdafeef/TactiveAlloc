# Design And Data Model

## Data Model

The SQLAlchemy model registry contains five application tables:

- `users`
- `sites`
- `equipment`
- `bookings`
- `maintenance_logs`

Tables are created by `Base.metadata.create_all` on startup and by `seed.py`.
The database is SQLite for local assessment portability.

## Important Entities

### User

Identifies who acts on the system. Fields include `id`, `username`,
`hashed_password`, and `role` (`site_engineer` or `manager`).

### Site

Represents a physical project location. Fields include `id`, `name`, and
`location`. Equipment travel between different sites enforces the transport
buffer.

### Equipment

Represents a machine in the fleet. Fields include `id`, `name`, `type`, and
`status` (`available`, `maintenance`, `booked`). Each equipment row links to
its bookings.

### Booking

Represents an equipment assignment. Fields include `equipment_id`, `site_id`,
`user_id`, `start_date`, `end_date`, `priority` (1 highest to 3 lowest),
`status` (`pending`, `approved`, `displaced`, `rejected`), `resolution_note`,
and `shift` (`morning`, `afternoon`, `full_day`).

### MaintenanceLog

Represents a maintenance window. Fields include `equipment_id`, `start_date`,
`end_date`, and `description`. Maintenance blocks overlapping bookings.

## Key Workflows

### Create Booking

1. User submits equipment, site, dates, priority, and shift.
2. Backend validates `end_date > start_date` and equipment existence.
3. Backend checks shift-aware maintenance conflicts.
4. OR-Tools scheduler evaluates the new booking against existing approved
   bookings with priority and transport-buffer constraints.
5. If accepted, lower-priority overlaps are displaced and a resolution note is
   written.
6. The new booking is stored as `approved`.

### Displacement

1. A higher-priority booking overlaps an existing lower-priority booking.
2. The scheduler maximizes total priority weight with an incumbency bonus.
3. The lower-priority booking loses the presence variable and is marked
   `displaced`.
4. The conflict is visible in `GET /conflicts`.

### Maintenance

1. A manager creates a maintenance window for a piece of equipment.
2. Future bookings check for overlap using the same shift-aware logic.
3. A `full_day` booking is blocked by either morning or afternoon maintenance
   on the same day; a `morning` booking can coexist with `afternoon`
   maintenance.

### Override

1. A manager opens the override panel for a booking.
2. The backend checks the manager role.
3. The booking status and resolution note are updated.

## Shift Logic

The system supports shift-aware allocation:

- morning: 08:00 to 12:00
- afternoon: 13:00 to 17:00
- full_day: 08:00 to 17:00 (occupies both shifts)

For single-day bookings on the same calendar day, the scheduler uses explicit
shift ranges. A `full_day` booking is treated as contiguous morning + afternoon
and therefore conflicts with either half-day maintenance.

## Transport Buffer

The transport buffer is the time required to move equipment between different
sites. Default is 4 hours (`TRANSPORT_BUFFER_HOURS`). The buffer is 0 when both
bookings are at the same site.

## Error Handling

- 400: invalid input, e.g. end date before start date.
- 401: authentication failure.
- 403: forbidden role.
- 404: equipment or booking missing.
- 409: scheduling conflict, maintenance conflict, or transport-buffer violation.

## Robustness Decisions

- Scheduling logic is deterministic and tested.
- Tests use an in-memory SQLite database with a `StaticPool` for full isolation.
- Auth is enforced by FastAPI dependencies on every protected route.
- The seed is idempotent and re-runs safely on startup.
- Default secrets are for local development only and documented as such.