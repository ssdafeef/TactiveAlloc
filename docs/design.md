# Design Document

## Problem
Construction equipment must be assigned to jobs while respecting availability, maintenance windows, transport time between sites, and priority rules. The system must avoid double-booking equipment and support conflict resolution when demand exceeds supply.

## Core domain model

### User
- username
- hashed_password
- role: site_engineer or manager

### Site
- id
- name
- location

### Equipment
- id
- name
- type
- status

### Booking
- equipment_id
- site_id
- user_id
- start_date
- end_date
- priority
- status
- shift: morning, afternoon, full_day
- resolution_note

### MaintenanceLog
- equipment_id
- start_date
- end_date
- description

## Key flows

### Booking flow
1. User submits booking data through the frontend.
2. Backend validates date ordering and equipment existence.
3. Backend checks whether the booking conflicts with maintenance or other approved bookings.
4. Scheduler resolves scheduling conflicts using priority and site rules.
5. If approved, the booking is written to the database.
6. If displaced, the old booking remains in the database with a displaced status.

### Maintenance flow
1. Manager creates maintenance for a piece of equipment.
2. The schedule is stored in the maintenance log.
3. Future bookings check for overlap with the maintenance window.

### Conflict flow
- All conflicting bookings are evaluated by equipment and date.
- Higher priority bookings are preserved.
- Lower priority bookings may be displaced.
- Equal priority conflicts are rejected.

## API design
The backend exposes a set of REST endpoints under /api:

- /api/auth/login
- /api/bookings
- /api/equipment
- /api/equipment/{id}
- /api/sites
- /api/maintenance
- /api/conflicts
- /api/bookings/{id}/override

## Error handling
- 400: invalid user input or invalid date ranges
- 401: authentication failure
- 403: forbidden role
- 404: equipment or booking missing
- 409: scheduling or maintenance conflict

## Shift logic
The system supports shift-aware allocation:
- morning: 08:00 to 12:00
- afternoon: 13:00 to 17:00
- full_day: 08:00 to 17:00

This allows non-overlapping bookings on the same day to coexist when their shifts do not overlap. A full-day booking is treated as occupying the full operational window and therefore conflicts with either morning or afternoon maintenance on that same day.

## Assumptions
- The assessment focuses on a small but realistic equipment booking scenario rather than a full enterprise system.
- SQLite is acceptable for local deployment and test execution.
- The transport buffer is simplified to a fixed time gap between different sites for the same equipment.
