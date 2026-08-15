# User Guide

## Logging in
1. Open the frontend application.
2. Enter a valid username and password for an existing user.
3. The system assigns access based on the user role.

## Roles
- Site engineer: can create equipment bookings
- Manager: can create maintenance records, review bookings, and override booking decisions

## Creating a booking
1. Go to the booking page.
2. Select the equipment.
3. Select the site.
4. Select the priority.
5. Choose the booking dates.
6. Choose the shift if applicable:
   - morning
   - afternoon
   - full_day
7. Submit the booking.

## What happens after submission
- If the booking is valid and no conflict exists, it is approved.
- If it conflicts with a higher-priority booking, it may be displaced.
- If it conflicts with maintenance or violates the transport buffer, the request is rejected.

## Viewing status
- The dashboard shows overall equipment utilization and active maintenance counts.
- The fleet page lists machines and their current status.
- The conflicts page shows displaced bookings and the system decision trail.

## Maintenance scheduling
Managers can create maintenance windows to block equipment for inspections or repairs. These windows are enforced during future booking checks.

## Overrides
Managers can manually change booking status from the override panel when operational exceptions require intervention.

## Troubleshooting
- If the booking fails with a conflict error, check the equipment, date, maintenance windows, and shift timing.
- If a role is denied, ensure the user account has the correct permissions.
- If the app does not start, follow the steps in the project README and verify the backend is running on port 8000.
