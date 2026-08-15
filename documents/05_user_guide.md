# User Guide

## Start Locally

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

Frontend (in a second terminal):

```powershell
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Backend and API docs:

```text
http://localhost:8000
http://localhost:8000/docs
```

## Logging In

Use one of the seeded accounts:

- Manager: `manager1` / `pass123`
- Site engineer: `engineer1` / `pass123`

The system assigns access based on the user role.

## Roles

- Site engineer: can create equipment bookings.
- Manager: can create maintenance records, review bookings, and override
  booking decisions.

## Main Screens

### Dashboard

Use the dashboard to see:

- Equipment utilization percentage.
- Active (approved) bookings.
- Displaced booking count.
- Active maintenance count.
- Recent booking timeline.
- Recent conflict activity.

### New Booking

Use New Booking to:

- Select equipment and a site.
- Choose a priority (P1 highest to P3 lowest).
- Pick start and end dates.
- Choose a shift:
  - morning (08:00-12:00)
  - afternoon (13:00-17:00)
  - full_day (08:00-17:00)
- Submit the booking.

What happens after submission:

- No conflict: the booking is approved.
- Overlap with lower priority: the lower-priority booking is displaced.
- Equal-priority overlap, maintenance conflict, or transport-buffer violation:
  the request is rejected with an error message.

### Fleet

Use Fleet to see machines and their current status:

- available
- maintenance
- booked

### Conflict Log

Use Conflict Log to see displaced bookings and the system's decision trail,
including the resolution note written during displacement.

### Override Panel

Managers can change a booking status and write a resolution note when an
operational exception requires manual intervention.

## Troubleshooting

- If a booking fails with a conflict error, check equipment, dates, shift
  timing, maintenance windows, and the transport buffer between sites.
- If a role is denied, ensure the account has the correct permissions
  (`manager1` for manager actions).
- If the app does not start, verify the backend is running on port 8000 and
  the frontend on port 5173, then follow the steps in the README.