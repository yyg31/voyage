# API reference

Base URL: `/api`. All endpoints except `/auth/login`, `/auth/forgot-password`
and `/auth/reset-password` require `Authorization: Bearer <JWT>`. Endpoints
marked **admin** additionally require `role: ADMIN`. JSON bodies/responses
throughout; errors are `{ "error": { "message": "...", "details"?: ... } }`.

## Auth — `/api/auth`

| Method & path              | Auth   | Body                                   | Response |
|-----------------------------|--------|------------------------------------------|----------|
| `POST /login`                | none   | `{ email, password }`                    | `{ token, user }` |
| `GET /me`                    | user   | —                                          | `{ user }` |
| `POST /change-password`      | user   | `{ currentPassword, newPassword }`        | `204` |
| `POST /forgot-password`      | none   | `{ email }`                                | `{ message }` (always 200; token logged server-side) |
| `POST /reset-password`       | none   | `{ token, newPassword }`                   | `204` |

## Users — `/api/users`

| Method & path     | Auth        | Body / query                                                  | Response |
|--------------------|-------------|-----------------------------------------------------------------|----------|
| `GET /`             | user        | —                                                                  | `{ users: [...] }` |
| `GET /:id`          | user        | —                                                                  | `{ user }` |
| `POST /`            | **admin**   | `{ email, password, firstName, lastName, familyId, role? }`      | `201 { user }` |
| `PATCH /:id`        | **admin**   | any subset of the above + `password?`                            | `{ user }` |
| `DELETE /:id`       | **admin**   | —                                                                  | `204` |

## Families — `/api/families`

| Method & path | Auth      | Body                        | Response |
|-----------------|-----------|--------------------------------|----------|
| `GET /`          | user      | —                               | `{ families: [...] }` (includes `members`) |
| `POST /`         | **admin** | `{ name, colorHex? }`           | `201 { family }` |
| `PATCH /:id`     | **admin** | partial                        | `{ family }` |
| `DELETE /:id`    | **admin** | —                               | `204` |

## Stopovers — `/api/stopovers`

| Method & path | Auth      | Body                                                                                          | Response |
|-----------------|-----------|--------------------------------------------------------------------------------------------------|----------|
| `GET /`          | user      | —                                                                                                  | `{ stopovers: [...] }` |
| `GET /:id`       | user      | —                                                                                                  | `{ stopover }` |
| `POST /`         | **admin** | `{ name, country, colorHex?, startDate, endDate, orderIndex?, families: [{ familyId, arrivalDate, departureDate }] }` | `201 { stopover }` |
| `PATCH /:id`     | **admin** | partial (passing `families` replaces the whole set)                                              | `{ stopover }` |
| `DELETE /:id`    | **admin** | —                                                                                                  | `204` |

## Activities (agenda) — `/api/activities`

| Method & path | Auth | Body / query | Response |
|-----------------|------|-----------------|----------|
| `GET /`          | user | query: `stopoverId?, type?, familyId?, from?, to?` | `{ activities: [...] }` |
| `GET /:id`       | user | —               | `{ activity }` |
| `POST /`         | user | `{ stopoverId?, title, description?, type, location?, startDateTime, endDateTime?, participantIds: [] }` | `201 { activity }` |
| `PATCH /:id`     | user | partial          | `{ activity }` |
| `DELETE /:id`    | user | —                | `204` |

`type` ∈ `FLIGHT, TRANSPORT, RESTAURANT, EXCURSION, VISIT, HOTEL, OTHER`.
An activity with an empty `participantIds` is treated as relevant to
everyone; `familyId` filtering matches activities with no participants OR
with at least one participant from that family.

## Links — `/api/links`

| Method & path | Auth | Body / query | Response |
|-----------------|------|-----------------|----------|
| `GET /`          | user | query: `stopoverId?, type?` — server-side filtered by the caller's family visibility | `{ links: [...] }` |
| `POST /`         | user | `{ title, url, type, stopoverId?, visibility, familyId? }` | `201 { link }` |
| `PATCH /:id`     | user | partial          | `{ link }` |
| `DELETE /:id`    | user | —                | `204` |

`type` ∈ `HOTEL, FLIGHT, RESTAURANT, EXCURSION, INFO, OTHER`.
`visibility` ∈ `BOTH, BACK, YGOUF` — when not `BOTH`, set `familyId` to the
matching family so the API can enforce it.

## Flights — `/api/flights`

| Method & path              | Auth | Body / form | Response |
|------------------------------|------|----------------|----------|
| `GET /`                       | user | —               | `{ flights: [...] }` |
| `GET /:id`                    | user | —               | `{ flight }` |
| `POST /`                      | user | `{ airline, flightNumber, departureCity, arrivalCity, departureDateTime, arrivalDateTime, participantIds: [] }` | `201 { flight }` (also creates a mirrored `FLIGHT` activity) |
| `PATCH /:id`                  | user | partial          | `{ flight }` (keeps the mirrored activity in sync) |
| `DELETE /:id`                 | user | —                | `204` (also deletes the mirrored activity) |
| `POST /:id/ticket`            | user | `multipart/form-data`, field `ticket` (pdf/png/jpeg/webp, ≤`MAX_UPLOAD_MB`) | `{ flight }` with `ticketFileUrl` set |

## Forum — `/api/forum`

| Method & path                          | Auth      | Body                              | Response |
|-------------------------------------------|-----------|--------------------------------------|----------|
| `GET /categories`                           | user      | —                                       | `{ categories: [...] }` |
| `POST /categories`                          | **admin** | `{ name, description?, orderIndex? }`  | `201 { category }` |
| `GET /threads`                              | user      | query: `categoryId?`                    | `{ threads: [...] }` |
| `GET /threads/:id`                          | user      | —                                       | `{ thread }` (includes `messages`) |
| `POST /threads`                             | user      | `{ categoryId, title, message }`        | `201 { thread }` |
| `POST /threads/:threadId/messages`          | user      | `{ content }`                           | `201 { message }` |
| `DELETE /messages/:id`                      | user      | — (own message, or admin)               | `204` |

## Misc

- `GET /health` — liveness probe, no auth, `{ status: "ok" }`.
- `GET /uploads/tickets/:file` — static file download, requires a valid
  session (any authenticated user).
