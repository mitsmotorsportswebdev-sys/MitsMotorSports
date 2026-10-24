# Events API

Successful responses use `{ "success": true, "data": ... }`; errors use
`{ "success": false, "message": "...", "fields": ... }`. Event IDs are MongoDB
`_id` values. Admin responses send `Cache-Control: no-store`.

## Event fields

Event bodies are strict and contain:

- `title` (1-180), `description` (1-3000), `image`, `eventDate`, `time` (1-80)
  and `venue` (1-180)
- `image` is either an `http://` or `https://` URL, or a site path beginning
  with one `/`
- `allowedYears`: one to four unique values from 1 through 4
- `seatLimit`: integer from 1 through 100000
- `closingAt`: no later than 23:59:59.999 IST on `eventDate`
- `published`: boolean, default `false`
- `participation`: `individual` or `group`
- `minTeamSize` and `maxTeamSize`: required only for groups, from 2 through
  20, with `maxTeamSize >= minTeamSize`
- `collegeOnly`: boolean, default `true`

## Registration fields

Registration validation is strict and is shared by public registration and
admin editing:

- `fullName`, `email`, `mobile`, `department`, `year`, and `collegeId`
- `collegeName` is required for non-college-only events
- `teamName` and `members` are required/allowed only for group events
- `mobile` accepts an Indian 10-digit number with optional `+91` and stores
  only the final 10 digits
- College-only events require an `@mgits.ac.in` email, one of the configured
  departments, and a college ID matching `^\d{2}[A-Z]{1,6}\d{1,4}$`
- Non-college-only events accept free-text department, college ID, and college
  name within their limits
- Every leader and member year must be in the event's `allowedYears`
- A group cannot repeat a college ID within one registration

`website` is the only accepted honeypot field. A non-empty value returns a
normal-looking `201` response without saving.

## Registration state and seats

Seats are computed from the sum of `headcount` across all registrations;
pending and approved entries both consume seats. State is:

- `ended`: the India-time event day has finished
- `closed`: unpublished, past `closingAt`, or fewer than the minimum entry size
  seats remain
- `open`: otherwise

No counters are stored on events. Concurrent submissions use the final
last-seat check and remove an entry that would exceed the limit.

## Public endpoints

- `GET /api/events` — published, not-ended events sorted by date
- `GET /api/events/:id` — a published event, including ended events
- `POST /api/events/:id/registrations` — rate-limited per IP

The registration limiter uses `EVENTS_RATE_LIMIT_WINDOW_MS` (default
`600000`) and `EVENTS_RATE_LIMIT_MAX` (default `10`). The response contains
the registration MongoDB ID and its `pending`/`approved` status.

## Admin endpoints

All require the existing admin bearer authentication:

- `GET /api/admin/events`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:id`
- `DELETE /api/admin/events/:id` with `{ "confirm": true }`
- `GET /api/admin/events/:id/registrations`
- `PATCH /api/admin/registrations/:id`
- `POST /api/admin/registrations/:id/approve`
- `POST /api/admin/events/:id/approve-all`
- `DELETE /api/admin/registrations/:id` with `{ "confirm": true }`
- `GET /api/admin/events/:id/export`

The registration list supports `?search=` across name, email, mobile, and
college ID, plus `?status=pending|approved`.

Exports contain approved entries only by default. With
`?includePending=true`, all entries are exported with a Status column. There
is one row per student, with the leader first and members after the leader.
All cells are protected against spreadsheet formula injection.

## Database reset

Before testing against an existing database, run `npm run reset-events -- --yes`
manually. The command prints the database name, refuses URI names that look
like production, and deletes the events and registrations collections. This
deletes all event data and is never run automatically.

The old import script is intentionally removed; events are created from the
admin panel.

## Stage 1 scope

Frontend code is intentionally unchanged. The current public form will not
work with this backend until Stage 3 updates the frontend payloads and routes.
