# API Documentation — Project Management System

Base URL (local development): `http://localhost:5000/api`

All request/response bodies are JSON. All authenticated endpoints require the header:

```
Authorization: Bearer <jwt_token>
```

## Standard response shape

Success:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Human readable message",
  "data": { }
}
```

Error:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Human readable message",
  "details": [ { "field": "email", "message": "Invalid email address" } ]
}
```

---

## Authentication

### POST /api/auth/register
Register a new user. Rate-limited (20 requests / 15 min / IP).

- **Auth required:** No
- **Request body:**
```json
{ "fullName": "Jane Doe", "email": "jane@example.com", "password": "Password123" }
```
- **Success 201:**
```json
{ "success": true, "data": { "user": { "id": "...", "fullName": "Jane Doe", "email": "jane@example.com" }, "token": "<jwt>" } }
```
- **Errors:** `400` validation failure, `409` email already registered.

### POST /api/auth/login
Log in with email and password. Rate-limited (20 requests / 15 min / IP).

- **Auth required:** No
- **Request body:** `{ "email": "jane@example.com", "password": "Password123" }`
- **Success 200:** `{ "data": { "user": {...}, "token": "<jwt>" } }`
- **Errors:** `401` invalid email or password.

### POST /api/auth/logout
- **Auth required:** Yes
- JWT is stateless. This endpoint is provided for API completeness/documentation; the client is responsible for discarding the stored token. See README "Authentication Persistence" for details on the client-side logout flow.
- **Success 200:** `{ "success": true, "message": "Logged out successfully" }`

### GET /api/auth/me
- **Auth required:** Yes
- Returns the currently authenticated user.
- **Success 200:** `{ "data": { "user": {...} } }`

---

## Projects

All project endpoints require authentication and only ever operate on projects owned by `req.user`. Attempting to access another user's project by ID returns `404` (never `403`, so the existence of the resource is not leaked).

### GET /api/projects
Query params (all optional): `search` (matches project name, case-insensitive), `status` (`NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`).

- **Success 200:** `{ "data": { "projects": [ { "id", "name", "description", "status", "startDate", "endDate", "createdAt", "updatedAt", "userId", "_count": { "tasks": 3 } } ] } }`

### GET /api/projects/:id
- **Success 200:** `{ "data": { "project": { ...project, "tasks": [ ... ] } } }`
- **Errors:** `404` not found / not owned by user.

### POST /api/projects
- **Request body:**
```json
{ "name": "Website Redesign", "description": "...", "status": "IN_PROGRESS", "startDate": "2026-08-01", "endDate": "2026-10-15" }
```
- `name` required. `status` defaults to `NOT_STARTED`. `endDate` must not be before `startDate`.
- **Success 201:** `{ "data": { "project": {...} } }`
- **Errors:** `400` validation failure.

### PUT /api/projects/:id
- Same body shape as POST; all fields optional (partial update).
- **Success 200:** `{ "data": { "project": {...} } }`
- **Errors:** `400` validation, `404` not found.

### DELETE /api/projects/:id
- Deletes the project and cascades to delete all of its tasks (`onDelete: Cascade` in the Prisma schema).
- **Success 200:** `{ "success": true, "message": "Project and its tasks deleted successfully" }`
- **Errors:** `404` not found.

---

## Tasks

All task endpoints require authentication. A task can only be created/read/updated/deleted if its parent project belongs to `req.user`.

### GET /api/tasks
Query params (all optional): `search` (task name), `status` (`PENDING` | `IN_PROGRESS` | `COMPLETED`), `priority` (`LOW` | `MEDIUM` | `HIGH`), `projectId` (scope to one project).

- **Success 200:** `{ "data": { "tasks": [ { ...task, "project": { "id", "name" } } ] } }`

### GET /api/tasks/:id
- **Success 200:** `{ "data": { "task": {...} } }`
- **Errors:** `404` not found / not owned by user.

### POST /api/tasks
- **Request body:**
```json
{ "name": "Design homepage", "description": "...", "priority": "HIGH", "status": "PENDING", "dueDate": "2026-09-20", "projectId": "<project-id>" }
```
- `name` and `projectId` required. Server verifies the target project belongs to the authenticated user before creating the task.
- **Success 201:** `{ "data": { "task": {...} } }`
- **Errors:** `400` validation, `404` project not found/not owned.

### PUT /api/tasks/:id
- Same body shape as POST; all fields optional (partial update). Reassigning `projectId` re-validates ownership of the new project.
- **Success 200:** `{ "data": { "task": {...} } }`
- **Errors:** `400` validation, `404` not found.

### PATCH /api/tasks/:id/complete
Convenience endpoint used by the "mark as completed" UI control.
- **Success 200:** `{ "data": { "task": { ...status: "COMPLETED" } } }`

### DELETE /api/tasks/:id
- **Success 200:** `{ "success": true, "message": "Task deleted successfully" }`
- **Errors:** `404` not found.

---

## Dashboard

### GET /api/dashboard/stats
- **Auth required:** Yes
- Returns statistics computed only from the authenticated user's own projects and tasks.
- **Success 200:**
```json
{
  "data": {
    "stats": {
      "totalProjects": 4,
      "projectsInProgress": 2,
      "projectsCompleted": 1,
      "totalTasks": 12,
      "completedTasks": 5,
      "pendingTasks": 4,
      "inProgressTasks": 3
    },
    "recentProjects": [ /* up to 5, most recent first */ ],
    "recentTasks": [ /* up to 5, most recent first, includes project name */ ]
  }
}
```

---

## HTTP status codes used

| Code | Meaning |
|------|---------|
| 200  | OK |
| 201  | Created |
| 400  | Bad Request — validation failure |
| 401  | Unauthorized — missing/invalid/expired token, or bad credentials |
| 403  | Forbidden — reserved for future role-based rules; not currently used since ownership checks return 404 |
| 404  | Not Found — route, project, or task not found (including "not yours") |
| 409  | Conflict — duplicate email, unique constraint violation |
| 429  | Too Many Requests — auth rate limit exceeded |
| 500  | Internal Server Error |

## GET /api/health
Unauthenticated health check endpoint used for uptime monitoring.
- **Success 200:** `{ "success": true, "message": "API is running" }`
