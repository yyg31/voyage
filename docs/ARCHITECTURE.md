# Architecture — asia26.ygouf.com

## Overview

```
                         ┌───────────────────────────┐
                         │      Host (bare metal)     │
                         │                             │
  Internet ── HTTPS ──►  │  Caddy (Caddyfile, host)   │
                         │   asia26.ygouf.com          │
                         │   - /api/*, /uploads/* ───┐ │
                         │   - /* (SPA)             │ │
                         └───────────┬───────┬──────┼─┘
                                     │       │      │
                         127.0.0.1:3000  127.0.0.1:4000
                                     │       │
                         ┌───────────▼─┐   ┌─▼─────────────┐
                         │  frontend    │   │   backend      │
                         │  (nginx,     │   │  (Node/Express │
                         │  static SPA) │   │  + Prisma)     │
                         └──────────────┘   └──────┬─────────┘
                                                    │
                                            ┌───────▼────────┐
                                            │  db (Postgres)  │
                                            │  Docker volume  │
                                            └─────────────────┘
```

All application containers (`frontend`, `backend`, `db`) run under Docker
Compose and only publish ports on `127.0.0.1`. Caddy runs directly on the
host (**not** in a container, per requirements) and is the only process
that terminates TLS and faces the internet. See `/Caddyfile`.

## Front-end: React + Vite + TypeScript

**Choice: React over Angular.** The app is a set of independent CRUD
screens (agenda, stopovers, links, flights, forum) rather than a large
enterprise app with heavy dependency-injection needs — React's smaller
footprint, faster iteration with Vite, and a huge ecosystem for the kind of
small UI primitives this app needs (calendar grid, forms, tag lists) made
it the pragmatic choice. Vite gives fast dev-server HMR and a small
production build.

**State management: TanStack React Query, not Redux.** Nearly all UI state
in this app *is* server state (activities, links, users, forum threads).
React Query gives caching, invalidation and loading/error state for that
with a fraction of Redux's boilerplate; introducing a separate global
store would duplicate what the query cache already provides. The only
genuinely client-side state (current user, form inputs, active filters) is
handled with local component state and a small `AuthContext`.

**Routing:** `react-router-dom` with a `ProtectedRoute` wrapper that
redirects unauthenticated users to `/login` and gates `/admin` behind the
`ADMIN` role.

## Back-end: Node.js + Express + Prisma + PostgreSQL

**Choice: Node/Express over FastAPI/Spring Boot.** The team already writes
JavaScript on the front-end; sharing the language reduces context-switching
for a small side-project team, and Express + Prisma gives a fast, typed
path from HTTP route to SQL without a lot of ceremony. Prisma's migration
tooling (`prisma migrate`) also makes the schema in `prisma/schema.prisma`
the single source of truth for the database.

Layering:
- `src/routes/*` — HTTP routes + input validation (`zod`) + auth gating.
- `src/controllers/*` — request handling, calls into Prisma.
- `src/middleware/*` — JWT auth (`attachUser`, `requireAuth`,
  `requireAdmin`), file upload (`multer`), centralized error handling.
- `prisma/schema.prisma` — data model (see `docs/DATA_MODEL.md`).
- `prisma/seed.js` — demo data (2 families, 9 members, 5 stopovers,
  demo flights/activities/links/forum threads).

## Auth & authorization

- JWT bearer tokens (`Authorization: Bearer <token>`), 7-day expiry by
  default. No public registration — only an `ADMIN` can create accounts
  (`POST /api/users`).
- Roles: `ADMIN`, `MEMBER`. Admins manage users, families, stopovers, and
  forum categories; any authenticated member can add/edit agenda items,
  links, flights, and forum posts (small trusted group, collaborative
  planning).
- Visibility: `Link.visibility` (`BOTH` / `BACK` / `YGOUF`) restricts a
  link to one family; the `/api/links` endpoint filters server-side based
  on the requesting user's family (admins see everything). Activities are
  visible to everyone by default (the whole itinerary), since even a
  family-only stopover (e.g. Phnom Penh for the Ygoufs) is useful context
  for the other family.
- Password reset: self-service `forgot-password` / `reset-password` with a
  time-limited one-time token (no SMTP wired up in this scaffold — the
  token is logged server-side so an admin can relay it manually; swap in a
  real mailer, e.g. `nodemailer`, for production). Admins can also directly
  set a member's password via `PATCH /api/users/:id`.

## File uploads

Flight tickets are uploaded via `multipart/form-data` to
`POST /api/flights/:id/ticket`, validated by MIME type (`pdf`, `png`,
`jpeg`, `webp`) and size (`MAX_UPLOAD_MB`, default 10MB) with `multer`,
and stored on a Docker volume (`backend_uploads`) under
`uploads/tickets/<uuid>.<ext>`. Downloads go through
`GET /uploads/tickets/:file`, which requires a valid session (see
`src/app.js`).

## Docker

- `backend/Dockerfile` — multi-stage Node 20 Alpine build; runs
  `prisma migrate deploy` on container start, then the API server.
- `frontend/Dockerfile` — multi-stage build: `npm run build` in a Node
  stage, served by a minimal `nginx:alpine` stage with SPA fallback
  routing (`frontend/nginx.conf`).
- `docker-compose.yml` — orchestrates `db` (Postgres 16, named volume),
  `backend`, `frontend`. All ports are bound to `127.0.0.1` so only Caddy
  (on the host) can reach them.
- Secrets (`JWT_SECRET`, DB password) come from a root `.env` file
  (see `.env.example`), never hardcoded in the images.

## Reverse proxy: Caddy (host, not containerized)

See `/Caddyfile`. Routes `/api/*` and `/uploads/*` to the backend
container, everything else to the frontend's static build, handles the
HTTP→HTTPS redirect and Let's Encrypt certificate automatically, and adds
baseline security headers (HSTS, `X-Frame-Options`, etc.).
