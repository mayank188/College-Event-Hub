# API Documentation

Base URL: `http://localhost:5000/api`  
Protected endpoints require `Authorization: Bearer <Firebase ID token>`.

## Health

`GET /health` — service status.

## Users

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/users/me` | Get current user profile |
| PATCH | `/users/me` | Update name: `{ "name": "Asha" }` |
| GET | `/users/me/registrations` | Get current user's active registrations |

## Events

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/events?q=music&category=Fest&upcoming=true` | List/search events |
| POST | `/events` | Create an event |
| GET | `/events/:id` | Get one event |
| PATCH | `/events/:id` | Update an owned event (or admin) |
| DELETE | `/events/:id` | Delete an owned event (or admin) |
| POST | `/events/:id/register` | Register current user |
| DELETE | `/events/:id/register` | Cancel current user's registration |

Create-event request body:

```json
{
  "title": "Annual Tech Fest",
  "description": "Competitions and workshops",
  "category": "Technology",
  "venue": "Main Auditorium",
  "startDate": "2027-02-12T09:00:00.000Z",
  "endDate": "2027-02-12T17:00:00.000Z",
  "capacity": 200
}
```

All responses use `{ "success": true|false, "message": "...", "data": ... }`.
