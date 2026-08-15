# API And Auth Reference

Base URL:

```text
http://127.0.0.1:8000/api
```

Interactive docs in development:

```text
http://127.0.0.1:8000/docs
```

Protected endpoints require:

```http
Authorization: Bearer <access token>
```

## Auth

- `POST /auth/login` - authenticate and return a bearer token.

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

- `GET /bookings` - list bookings. Query params: `site_id`, `equipment_id`,
  `status`, `limit`, `offset`.
- `POST /bookings` - create a booking with conflict, maintenance, and
  transport-buffer checks.
- `PATCH /bookings/{id}/override` - manager only; update status and note.

Create booking request:

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

Override request:

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

Request:

```json
{
  "equipment_id": 1,
  "start_date": "2025-01-05T08:00:00Z",
  "end_date": "2025-01-05T12:00:00Z",
  "description": "Routine inspection"
}
```

## Conflicts

- `GET /conflicts` - list displaced bookings ordered by newest first.

## Error Handling

| Status | Meaning |
| --- | --- |
| 400 | Invalid input, e.g. end date before start date |
| 401 | Missing or invalid bearer token |
| 403 | Authenticated role not permitted for the operation |
| 404 | Equipment or booking not found |
| 409 | Scheduling conflict, maintenance conflict, or transport-buffer violation |

## Auth Model

- Passwords are hashed with bcrypt before storage.
- JWT tokens are signed with HS256 and expire after 30 minutes.
- The token payload carries the user id (`sub`) and role.
- `require_role("manager")` guards maintenance creation and overrides.
- Site engineers can log in and create bookings but cannot perform manager
  actions.

Demo accounts (documented in the README, not in this API reference):

- `manager1` / `pass123` - manager.
- `engineer1` / `pass123` - site engineer.

Secrets note: the default `SECRET_KEY` is for local development only. Real
deployments must set `SECRET_KEY` via environment variables and must never
commit credentials.