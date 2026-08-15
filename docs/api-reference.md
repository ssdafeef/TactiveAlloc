# Equipment Allocation API Reference

Base URL:

```text
http://127.0.0.1:8000/api
```

Interactive docs:

```text
http://127.0.0.1:8000/docs
```

All protected endpoints require a bearer token returned by `POST /auth/login`.

```http
Authorization: Bearer <access token>
```

## Auth

- `POST /auth/login` - authenticate a user and return an access token.

Request (OAuth2 password form):

```text
username=manager1
password=pass123
```

Response:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "role": "manager"
}
```

## Bookings

- `GET /bookings` - list bookings.
  - Query params: `site_id`, `equipment_id`, `status`, `limit`, `offset`.
- `POST /bookings` - create a booking with conflict, maintenance, and transport-buffer checks.
- `PATCH /bookings/{id}/override` - manager only; change a booking status and resolution note.

Create booking request body:

```json
{
  "equipment_id": 1,
  "site_id": 1,
  "start_date": "2025-01-01T08:00:00Z",
  "end_date": "2025-01-01T17:00:00Z",
  "priority": 2,
  "shift": "full_day"
}
```

`priority` is 1 (highest) to 3 (lowest). `shift` is `morning`, `afternoon`, or `full_day`.

Override request body:

```json
{
  "status": "displaced",
  "resolution_note": "Manual override by manager"
}
```

## Equipment

- `GET /equipment` - list equipment.
- `GET /equipment/{id}` - equipment detail including its bookings.

## Sites

- `GET /sites` - list sites.

## Maintenance

- `GET /maintenance` - list maintenance windows. Query param: `equipment_id`.
- `POST /maintenance` - manager only; create a maintenance window.

Create maintenance request body:

```json
{
  "equipment_id": 1,
  "start_date": "2025-01-05T08:00:00Z",
  "end_date": "2025-01-05T12:00:00Z",
  "description": "Routine inspection"
}
```

## Conflicts

- `GET /conflicts` - list bookings that were displaced by higher-priority requests.

## Error Handling

| Status | Meaning |
| --- | --- |
| 400 | Invalid input, e.g. end date before start date |
| 401 | Missing or invalid bearer token |
| 403 | Authenticated role not permitted for the operation |
| 404 | Equipment, booking, or other record not found |
| 409 | Scheduling conflict, maintenance conflict, or transport-buffer violation |