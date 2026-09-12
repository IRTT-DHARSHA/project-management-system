# Project Management System

A full-stack web application for managing projects and tasks: register/login securely, create projects, break them into tasks, track progress, and search/filter everything — with each user only ever able to see their own data.
## Live Deployment Links
- **Live Frontend**: https://pms-web-app-three.vercel.app
- **Live Backend API**: https://pms-backend-udj0.onrender.com/api
- **GitHub Repository**: https://github.com/IRTT-DHARSHA/project-management-system

## 1. Project Overview

Users register and log in, then create projects and add tasks to them. A dashboard summarizes progress across all of a user's projects and tasks. Every API route is protected by JWT authentication and enforces per-user data ownership, so one account can never read or modify another account's projects or tasks — even by guessing IDs in the URL.

## 2. Features

- Email/password registration and login with bcrypt password hashing and JWT sessions
- Protected frontend routes (redirect to login when unauthenticated)
- Full CRUD for Projects and Tasks, scoped to the logged-in user
- One-click "mark as completed" on tasks
- Dashboard with total/in-progress/completed project and task counts, plus recent activity
- Search projects/tasks by name; filter projects by status; filter tasks by status and priority
- Centralized error handling, request validation (Zod), rate limiting on auth endpoints
- Responsive, accessible UI with loading, empty, and error states throughout

## 3. Technology Stack

**Frontend:** React, Vite, React Router, Axios, plain CSS (custom design system, no UI framework)
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**ORM:** Prisma
**Auth:** JWT (jsonwebtoken) + bcrypt
**Validation:** Zod
**Other:** express-rate-limit, morgan (logging), cors, dotenv

## 4. Project Architecture

```
project-management-system/
├── backend/                 # Express REST API
│   ├── src/
│   │   ├── config/          # Prisma client instance
│   │   ├── controllers/     # Route handler logic
│   │   ├── middleware/      # auth, error handling, rate limiting, 404
│   │   ├── routes/          # Express routers
│   │   ├── utils/           # ApiError, ApiResponse, jwt, logger, asyncHandler
│   │   └── validators/      # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, ProtectedRoute, cards, modals, etc.
│   │   ├── pages/             # Login, Register, Dashboard, Projects, Tasks, etc.
│   │   ├── services/          # Axios API clients
│   │   ├── context/           # AuthContext
│   │   ├── hooks/              # useAuth, useDebounce
│   │   ├── utils/               # constants, validators
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docker-compose.yml         # Postgres + backend + frontend (bonus)
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
└── README.md
```

The backend follows a layered architecture: **routes → middleware → controllers → Prisma (database)**, with validation schemas and utility helpers kept separate so each layer has one responsibility.

## 5. Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (a local install, or use the provided `docker-compose.yml`)

## 6. Installation Instructions

Clone/copy the project, then set up the backend and frontend separately (see sections 7–8 below). In short:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## 7. Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env and set DATABASE_URL, JWT_SECRET, etc. (see section 11)

npm install
npx prisma migrate dev --name init   # creates tables in your database
npm run seed                          # optional: adds a demo user + sample data
npm run dev                           # starts the API on http://localhost:5000
```

## 8. Frontend Setup

```bash
cd frontend
cp .env.example .env
# edit .env if your API isn't running on http://localhost:5000/api

npm install
npm run dev     # starts the app on http://localhost:5173
```

## 9. Database Setup

Option A — local PostgreSQL:
1. Create a database, e.g. `createdb pms_db`.
2. Point `DATABASE_URL` in `backend/.env` at it.

Option B — Docker (bonus, see `docker-compose.yml`):
```bash
docker compose up -d postgres
```
This starts PostgreSQL on `localhost:5432` with the credentials already wired into `docker-compose.yml`'s `backend` service.
## Database Schema (ER Diagram)
<img width="827" height="2573" alt="image" src="https://github.com/user-attachments/assets/b39699ed-c58c-4c56-9573-8bf14a6f0687" />


## 10. Prisma Migration Commands

Run from `backend/`:

| Command | Purpose |
|---|---|
| `npx prisma migrate dev --name init` | Create and apply the initial migration (local dev) |
| `npx prisma migrate deploy` | Apply pending migrations (production/CI) |
| `npx prisma generate` | Regenerate the Prisma Client |
| `npx prisma studio` | Open a GUI to browse/edit data |
| `npm run seed` | Populate demo data |

## 11. Environment Variables

**backend/.env**
```
DATABASE_URL=postgresql://username:password@localhost:5432/pms_db?schema=public
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

Never commit real `.env` files — only the `.env.example` templates are checked in.

## 12. How to Run the Application

1. Start PostgreSQL (local or `docker compose up -d postgres`).
2. Backend: `cd backend && npm run dev` (http://localhost:5000).
3. Frontend: `cd frontend && npm run dev` (http://localhost:5173).
4. Open http://localhost:5173, register a new account (or log in with the seeded demo account: `demo@example.com` / `Password123!`), and start creating projects and tasks.

Alternatively, run everything with Docker:
```bash
docker compose up --build
```

## 13. API Documentation Reference

See [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md) for every endpoint, its auth requirement, request/response shape, and error cases.

## 14. Database Schema Explanation

See [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md) for the full ER diagram, relationships, indexes, and normalization notes.

## 15. Security Features

- Passwords hashed with **bcrypt** (10 salt rounds); plaintext passwords are never stored or logged.
- **JWT** authentication on every protected route via a dedicated middleware that validates the token and loads the current user.
- **Authorization**: every project/task lookup is scoped to `req.user.id` (projects directly, tasks transitively through their parent project). Cross-user access attempts return `404`, not `403`, so resource existence is never leaked.
- **Input validation** on every write endpoint via Zod schemas (required fields, email format, password strength, enum values, date validity, end-date-after-start-date).
- **SQL injection protection** via Prisma's parameterized query builder — no raw SQL with interpolated user input anywhere in the codebase.
- **Rate limiting** (`express-rate-limit`) on `/api/auth/register` and `/api/auth/login` to slow brute-force/credential-stuffing attempts.
- **Centralized error handling** that never leaks stack traces, database internals, or secrets to the client.
- CORS restricted to the configured `FRONTEND_URL`.

## 16. Screenshots

_Add screenshots of the Login, Dashboard, Projects, and Task views here once the app is running locally._

## 17. Deployment Instructions

1. Provision a managed PostgreSQL instance (e.g. Supabase, Neon, RDS) and set `DATABASE_URL` accordingly.
2. Backend: deploy `backend/` to any Node host (Render, Railway, Fly.io, EC2, etc.); set the environment variables from section 11, then run `npx prisma migrate deploy` followed by `node server.js` (see `docker-compose.yml`'s backend `command` for reference).
3. Frontend: build a static bundle with `npm run build` inside `frontend/` and deploy the `dist/` folder to any static host (Vercel, Netlify, S3+CloudFront); set `VITE_API_BASE_URL` to your deployed backend's URL at build time.
4. Update the backend's `FRONTEND_URL` env var to your deployed frontend's origin so CORS allows it.
5. Use a strong, randomly generated `JWT_SECRET` in production — never reuse the example value.
