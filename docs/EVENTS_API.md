# Events API

All dates are stored and returned as UTC-compatible ISO values where applicable.
The `eventDate` field is a calendar date (`YYYY-MM-DD`) and is displayed in
India time by the frontend. The existing `annual-motorsport-meet` id becomes the
immutable slug `annual-motorsport-meet`.

## Validation limits

Registration input is strict; unknown fields are rejected.

- `fullName`: 1-120 characters
- `email`: valid email, maximum 254 characters; trimmed and lowercased
- `phone`: optional `+`, then digits/spaces/hyphens; 10-20 characters
- `college`: 1-160 characters
- `teamName`: maximum 160 characters
- `participantType`: `Individual`, `Team`, or `Club/Organization`
- `participantCount`: whole number from 1 through 100
- `experience`: maximum 120 characters
- `requirements`: maximum 1000 characters
- `termsAccepted`: must be `true`
- `turnstileToken`: 1-2048 characters

Event text fields are capped between 40 and 3000 characters according to field
purpose; list fields contain at most 100 entries and each entry is at most 500
characters. `seatLimit` is a whole number from 1 through 100,000. `closingAt`
must not be later than the end of `eventDate` in Asia/Kolkata.

## Response and error format

Success responses use `{ "success": true, "data": ... }`. Errors use:

```json
{ "success": false, "message": "Human-readable message", "fields": { "email": ["..."] } }
```

`fields` is present for validation errors and is safe for form display. Public
responses never include registrations.

## Public endpoints

### `GET /api/events`

Public. Returns upcoming published events with public event fields, `seatsLeft`,
`closingAt`, and computed `registrationState` (`open`, `full-waiting-list`,
`closed`, or `ended`). Past events are excluded.

### `GET /api/events/:slug`

Public. Returns one published event. Past events are returned with `ended: true`.
Drafts and unknown slugs return `404`.

### `POST /api/events/:slug/registrations`

Public, Turnstile-protected, and rate-limited. Accepts the registration fields
listed above. Returns only:

```json
{ "registrationId": "MMS-0042", "status": "confirmed" }
```

The server rechecks publication, event date, registration switch, closing time,
duplicate email, and seat availability. Seat allocation uses an atomic
conditional event update, so simultaneous requests cannot oversell seats. If
registration insertion fails after a confirmed reservation, the server
decrements the counter. A process crash between those operations can leave a
temporary counter drift; run the authenticated reconcile endpoint during
maintenance to recount confirmed records and repair it.

## Admin event endpoints

All require the existing admin Bearer token and send no-store responses.

- `GET /api/admin/events` — list drafts, upcoming, and past events with counts
- `POST /api/admin/events` — create an event; slug is required and immutable
- `PATCH /api/admin/events/:id` — edit all event fields except slug
- `DELETE /api/admin/events/:id` — delete event and registrations; body requires `{ "confirm": true }`
- `GET /api/admin/events/:id/registrations` — list registrations; supports `status` (`confirmed`, `waitlist`, `needs-contacting`, `cancelled`) and `search`
- `DELETE /api/admin/events/:id/registrations` — permanently delete all registrations; body requires confirmation
- `POST /api/admin/events/:id/reconcile` — recount confirmed registrations and repair the cached counter
- `GET /api/admin/events/:id/export` — export all registrations as an Excel file
- `GET /api/admin/needs-contacting/count` — count confirmed registrations not yet contacted

## Admin registration endpoints

- `PATCH /api/admin/registrations/:id` — correct registration details
- `POST /api/admin/registrations/:id/cancel` — cancel and promote the earliest waitlisted registration
- `DELETE /api/admin/registrations/:id` — permanently delete; body requires confirmation
- `POST /api/admin/registrations/:id/contacted` — mark contacted
- `POST /api/admin/registrations/:id/paid` — body `{ "paid": true|false }`

Registration records contain status, readable registration ID, timestamps,
contacted/paid fields, and admin-only duplicate phone/name-college flags.
Cancelled emails may register again. Increasing the seat limit promotes the
earliest waitlisted records; lowering it never removes confirmed registrations.
When lowering below the current confirmed count, the update succeeds and
returns a `warning` field; no confirmed registration is removed.

## Initial event import

The existing local event content can be imported once, interactively, with:

```text
npm run import-events
```

The command requires typing `IMPORT`, refuses to overwrite an existing slug,
and never runs automatically.

## Environment variables

The server uses `TURNSTILE_SECRET_KEY`. The browser must use
`VITE_TURNSTILE_SITE_KEY`. Both are required by the respective runtime. Use
Cloudflare's official Turnstile test keys only in development/test
configuration; use placeholders in committed examples. There is no
`NODE_ENV`-based bypass: if the server secret is absent, the server refuses to
start, and injected test verifiers are only available to tests.
