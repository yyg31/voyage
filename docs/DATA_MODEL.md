# Data model

Source of truth: `backend/prisma/schema.prisma`. Summary below (PostgreSQL,
managed by Prisma migrations under `backend/prisma/migrations/`).

## families
| column     | type      | notes            |
|------------|-----------|------------------|
| id         | uuid PK   |                  |
| name       | text      | unique — "Back" / "Ygouf" |
| colorHex   | text      | UI tag color     |
| createdAt  | timestamp |                  |

## users
| column       | type      | notes                          |
|--------------|-----------|---------------------------------|
| id           | uuid PK   |                                 |
| email        | text      | unique, login identifier       |
| passwordHash | text      | bcrypt                         |
| firstName    | text      |                                 |
| lastName     | text      |                                 |
| role         | enum      | `ADMIN` \| `MEMBER`             |
| familyId     | uuid FK   | → families.id                  |
| avatarColor  | text      |                                 |
| createdAt / updatedAt | timestamp |                       |

## password_reset_tokens
| column     | type      | notes                    |
|------------|-----------|---------------------------|
| id         | uuid PK   |                            |
| token      | text      | unique, random 32-byte hex |
| userId     | uuid FK   | → users.id (cascade)      |
| expiresAt  | timestamp | 1h TTL                    |
| usedAt     | timestamp | nullable                  |

## stopovers
| column     | type      | notes                          |
|------------|-----------|---------------------------------|
| id         | uuid PK   |                                 |
| name       | text      | e.g. "Phnom Penh"                |
| country    | text      |                                 |
| colorHex   | text      | UI tag color                    |
| startDate / endDate | date  | overall window (union of family presence) |
| orderIndex | int       | display order on the itinerary  |

## stopover_families
Per-family presence at a stopover (a stopover can have 1 or 2 families).
| column         | type    | notes                       |
|----------------|---------|-------------------------------|
| id             | uuid PK |                               |
| stopoverId     | uuid FK | → stopovers.id (cascade)      |
| familyId       | uuid FK | → families.id (cascade)       |
| arrivalDate    | date    |                               |
| departureDate  | date    |                               |
Unique on `(stopoverId, familyId)`.

## activities
The agenda: every restaurant/excursion/visit/transport/flight entry.
| column         | type      | notes                                      |
|----------------|-----------|---------------------------------------------|
| id             | uuid PK   |                                             |
| stopoverId     | uuid FK   | → stopovers.id, nullable (SET NULL)        |
| title          | text      |                                             |
| description    | text      | nullable                                   |
| type           | enum      | `FLIGHT`\|`TRANSPORT`\|`RESTAURANT`\|`EXCURSION`\|`VISIT`\|`HOTEL`\|`OTHER` |
| location       | text      | nullable                                   |
| startDateTime / endDateTime | timestamp | endDateTime nullable          |
| createdAt / updatedAt | timestamp |                                     |

## activity_participants
Join table; **no rows for an activity = relevant to everyone** (the common
case for group activities). Explicit rows scope an activity to specific
members (used for the family-filtered agenda view).
| column     | type    | notes                              |
|------------|---------|---------------------------------------|
| id         | uuid PK |                                        |
| activityId | uuid FK | → activities.id (cascade)             |
| userId     | uuid FK | → users.id (cascade)                  |
Unique on `(activityId, userId)`.

## flights
| column             | type      | notes                              |
|--------------------|-----------|---------------------------------------|
| id                 | uuid PK   |                                        |
| airline            | text      |                                        |
| flightNumber       | text      |                                        |
| departureCity / arrivalCity | text |                                 |
| departureDateTime / arrivalDateTime | timestamp |                  |
| ticketFileUrl      | text      | nullable, `/uploads/tickets/<uuid>.<ext>` |
| activityId         | uuid FK   | unique, → activities.id — every flight is mirrored into the agenda as a `FLIGHT` activity |
| createdAt          | timestamp |                                        |

## flight_participants
Same shape as `activity_participants`, one row per traveler on the flight.

## links
"Liens & ressources" — hotel/activity/practical-info links per stopover.
| column       | type      | notes                                        |
|--------------|-----------|-------------------------------------------------|
| id           | uuid PK   |                                                  |
| title        | text      |                                                  |
| url          | text      |                                                  |
| type         | enum      | `HOTEL`\|`FLIGHT`\|`RESTAURANT`\|`EXCURSION`\|`INFO`\|`OTHER` |
| stopoverId   | uuid FK   | nullable, → stopovers.id (SET NULL)            |
| visibility   | enum      | `BOTH`\|`BACK`\|`YGOUF`                         |
| familyId     | uuid FK   | nullable, → families.id — set when `visibility` restricts to one family |
| createdById  | uuid FK   | → users.id                                      |
| createdAt    | timestamp |                                                  |

## forum_categories
| column      | type    | notes                     |
|-------------|---------|-----------------------------|
| id          | uuid PK |                              |
| name        | text    | unique — Général, Logistique, Idées de visites, Restaurants, ... |
| description | text    | nullable                    |
| orderIndex  | int     |                              |

## forum_threads
| column     | type      | notes                          |
|------------|-----------|-----------------------------------|
| id         | uuid PK   |                                    |
| categoryId | uuid FK   | → forum_categories.id (cascade)   |
| title      | text      |                                    |
| authorId   | uuid FK   | → users.id                        |
| createdAt  | timestamp |                                    |

## forum_messages
| column    | type      | notes                       |
|-----------|-----------|--------------------------------|
| id        | uuid PK   |                                 |
| threadId  | uuid FK   | → forum_threads.id (cascade)   |
| authorId  | uuid FK   | → users.id                     |
| content   | text      |                                 |
| createdAt | timestamp |                                 |
