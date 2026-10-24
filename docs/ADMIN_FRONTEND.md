# MITS Motorsports Admin Frontend

The admin panel is part of the existing Vite/React application. It does not
create a second frontend project.

## Routes

- `/admin/login` - admin sign-in
- `/admin` - dashboard and backend connection status
- `/admin/events` - event inventory and event creation
- `/admin/home` - homepage singleton editor
- `/admin/about` - about singleton editor
- `/admin/projects` - project list and project creation
- `/admin/team` - read-only team inventory
- `/admin/alumni` - read-only alumni inventory
- `/admin/sponsors` - read-only sponsor inventory
- `/admin/gallery` - read-only gallery inventory
- `/admin/legacy` - read-only legacy inventory

## API routes used

Public reads use `GET /api/home`, `/about`, `/projects`, `/team`, `/alumni`,
`/sponsors`, `/gallery`, and `/legacy`.

Authenticated writes use:

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/password`
- `PUT /api/admin/home`
- `PUT /api/admin/about`
- `POST /api/admin/projects`
- `GET /api/admin/events`
- `POST /api/admin/events`
- `POST /api/admin/upload/{home|about|projects|team|alumni|sponsors|gallery|legacy}`

The API client adds the Bearer token centrally and clears the session on a `401`
response. Normal browser session storage is used for the short-lived JWT and
admin user record; passwords are never stored.

## Environment

Set `VITE_API_URL` for the browser-facing API base URL. The example development
value is `http://localhost:5000/api`. Do not put JWT secrets, database
credentials, or admin passwords in `VITE_*` variables.

The backend uses the server-side variables in `.env.example`. The admin is
created privately with `npm run setup-admin` and its password is reset with
`npm run reset-admin-password`; neither operation has a public API route.

## Implemented

- Protected admin route tree with login redirect and logout
- Responsive industrial admin layout with sidebar and mobile drawer
- Dashboard counts from the available public collection endpoints
- Real backend connection indicator
- Home and About editors using only backend-supported fields
- Project creation using the existing backend contract
- Event inventory and creation using the authenticated admin event endpoints,
  including draft/published and registration-open/closed settings
- Event editing using the complete backend update payload while preserving the
  immutable slug and displaying seat-limit warnings
- Shared image uploader with drag/drop, preview, JPEG/PNG/WebP validation, and 5
  MB limit
- Loading, empty, error, and save feedback states
- Typed API models and centralized error handling

## Backend-dependent limitations

The current backend does not expose admin CRUD endpoints for TeamMember,
Sponsor, GalleryItem, Legacy, or Alumni. Those screens intentionally show
available published data and mark themselves read-only rather than making fake
requests. Alumni also has no model and its current endpoint returns an empty
array.

Project update and delete endpoints are not exposed either, so the Projects
screen supports creation only. The backend should add and authorize those
endpoints before edit/delete controls are enabled.

## Local development

1. Start MongoDB and configure the server environment.
2. Start the API separately at the URL configured by `VITE_API_URL`.
3. Start the Vite app with `npm run dev`.
4. Visit `http://localhost:5173/admin/login`.

Run `npm run setup-admin` once on the server to create the configured admin.
The command prompts for a password and refuses to run when an admin already
exists. Run `npm run reset-admin-password` to replace the existing password.
