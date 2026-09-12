# Database Schema

Database: **PostgreSQL** · ORM: **Prisma** · Schema file: `backend/prisma/schema.prisma`

## Entity Relationship Diagram

```
┌──────────────────────┐
│         User          │
├──────────────────────┤
│ id            (PK)    │  uuid
│ fullName               │  string
│ email         (unique) │  string
│ password               │  string (bcrypt hash)
│ createdAt               │  datetime
│ updatedAt               │  datetime
└──────────┬───────────┘
           │ 1
           │
           │ owns
           │
           │ many
┌──────────▼───────────┐
│        Project        │
├──────────────────────┤
│ id            (PK)    │  uuid
│ name                   │  string
│ description            │  string, nullable
│ status                 │  enum: NOT_STARTED | IN_PROGRESS | COMPLETED
│ startDate               │  datetime, nullable
│ endDate                 │  datetime, nullable
│ createdAt               │  datetime
│ updatedAt               │  datetime
│ userId        (FK)     │  → User.id  (ON DELETE CASCADE)
└──────────┬───────────┘
           │ 1
           │
           │ contains
           │
           │ many
┌──────────▼───────────┐
│         Task          │
├──────────────────────┤
│ id            (PK)    │  uuid
│ name                   │  string
│ description            │  string, nullable
│ priority                │  enum: LOW | MEDIUM | HIGH
│ status                 │  enum: PENDING | IN_PROGRESS | COMPLETED
│ dueDate                 │  datetime, nullable
│ createdAt               │  datetime
│ updatedAt               │  datetime
│ projectId     (FK)     │  → Project.id  (ON DELETE CASCADE)
└──────────────────────┘
```

**Relationships**

- `User 1 ── * Project` — a user owns many projects; each project belongs to exactly one user (`Project.userId`).
- `Project 1 ── * Task` — a project contains many tasks; each task belongs to exactly one project (`Task.projectId`).
- Both foreign keys cascade on delete: deleting a `User` deletes all of their `Project`s (and transitively their `Task`s); deleting a `Project` deletes all of its `Task`s.

## Indexes

- `User.email` — unique index (enforces one account per email, and speeds up login lookups).
- `Project.userId` — index (speeds up "list my projects" queries and ownership checks).
- `Task.projectId` — index (speeds up "list tasks in project" queries and ownership checks).

## Enums

| Enum | Values |
|------|--------|
| `ProjectStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `TaskPriority` | `LOW`, `MEDIUM`, `HIGH` |
| `TaskStatus` | `PENDING`, `IN_PROGRESS`, `COMPLETED` |

## Normalization notes

- The schema is in 3NF: each table stores attributes of a single entity, all non-key attributes depend only on the primary key, and there is no data duplication between `User`, `Project`, and `Task`.
- Ownership of a `Task` is derived transitively through its `Project` rather than duplicating `userId` on the `Task` table, which keeps the schema normalized and avoids the two fields ever drifting out of sync.

## Migrations

Prisma migrations live in `backend/prisma/migrations/` once generated. To create and apply the initial migration against your local PostgreSQL instance:

```bash
cd backend
npx prisma migrate dev --name init
```

This also regenerates the Prisma Client used throughout `backend/src`.

## Seed data

`backend/prisma/seed.js` creates one demo user (`demo@example.com` / `Password123!`) with two sample projects and several tasks in different statuses/priorities, useful for manually exercising the dashboard, search, and filters. Run it with:

```bash
npm run seed
```
