# Team and project API

Public responses use `{ success: true, data }`. Public project and image responses
are cacheable; admin responses use `Cache-Control: no-store` and require a bearer
admin token.

## Public

- `GET /api/projects` returns `{ slug, title, tagline, heroImageUrl }[]`.
- `GET /api/projects/:slug` returns project text, `stats`, `specs`, ordered
  `groups`, and `memberCount`. Each group is `{ id, name, members }`; each member
  is `{ id, name, role, extras, imageUrl }`. Hidden members are omitted.
- `GET /api/images/:id` returns the original JPEG, PNG, or WebP bytes with an
  immutable cache header, an ETag, and `X-Content-Type-Options: nosniff`.

## Admin

`GET /api/admin/projects`, `GET /api/admin/projects/:slug`, and
`PATCH /api/admin/projects/:slug` manage project text, stats, specs, and sections.
`PUT|DELETE /api/admin/projects/:slug/hero` manage the hero image.

`POST /api/admin/projects/:slug/groups`, `PATCH /api/admin/groups/:id`,
`POST /api/admin/groups/:id/move`, and `DELETE /api/admin/groups/:id` manage
ordered sections. Deletion requires `{ "confirm": true }` and refuses non-empty
sections.

`POST /api/admin/groups/:id/members`, `PATCH /api/admin/members/:id`,
`POST /api/admin/members/:id/move`, and `DELETE /api/admin/members/:id` manage
ordered members. A member can move only to a group in the same project.
`PUT|DELETE /api/admin/members/:id/photo` manage member images.

Image uploads are raw request bodies, limited to 400 KB, and must have matching
JPEG, PNG, or WebP magic bytes. Run `npm run seed-team` once against the configured
database to import the current Aethon and E-Baja static content; it refuses to
run if either project already exists.

Public project reads are rate-limited per IP using `TEAM_RATE_LIMIT_WINDOW_MS`
(default `900000`) and `TEAM_RATE_LIMIT_MAX` (default `300`). Configure these
environment variables to tune the public read limit.
