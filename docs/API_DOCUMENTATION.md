# Eventra API Documentation

## 📖 Prerequisites

Before working with the API, ensure your environment is properly configured:

**\u2705 [Environment Setup Guide](ENV_SETUP_GUIDE.md)** – Complete configuration instructions including:

- Backend API URL configuration (`REACT_APP_API_URL`)
- Running the backend locally
- Troubleshooting connection issues
- Mock API vs real API modes

---

## Overview

Eventra provides a RESTful backend API built using Spring Boot and secured using JWT Authentication.

The APIs support:

- User authentication
- Event management
- Public and protected endpoint access
- Structured error handling
- Swagger/OpenAPI integration

**For detailed information on authentication flows, role-based access control, and how permissions work, see the [Architecture & Roles Guide](ARCHITECTURE_AND_ROLES.md#-route-protection--authentication-flow).**

---

# Swagger/OpenAPI Documentation

## Production Swagger UI

```bash
https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html
```

---

## Local Swagger UI

After starting the Spring Boot backend locally:

```bash
http://localhost:8080/swagger-ui/index.html
```

If the backend runs on another port (example: `8081`), replace the port accordingly.

---

# Authentication Flow

Eventra uses JWT-based authentication.

## Step 1 — Register User

### Endpoint

```bash
POST /api/auth/signup
```

### Request Body

```json
{
  "firstName": "john",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

---

## Step 2 — Login User

### Endpoint

```bash
POST /api/auth/login
```

### Request Body

```json
{
  "usernameOrEmail": "john@example.com",
  "password": "password123"
}
```

---

## Alternative: Google OAuth Login

### Endpoint

```bash
POST /api/auth/google
```

### Request Body

```json
{
  "credential": "GOOGLE_ID_TOKEN_FROM_GOOGLE_OAUTH"
}
```

---

## Step 3 — Copy JWT Token

Successful login returns:

```json
{
  "token": "JWT_TOKEN",
  "tokenType": "Bearer",
  "id": 1,
  "firstName": "john",
  "lastName": "doe",
  "email": "john@example.com",
  "username": "john",
  "role": "CLIENT"
}
```

---

## Step 4 — Authorize Swagger

Click the **Authorize** button in Swagger UI and enter:

```bash
Bearer YOUR_JWT_TOKEN
```

Example:

```bash
Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

# Authentication APIs

## Signup

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/signup` |

Creates a new user account and returns a JWT token.

---

## Login

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/login` |

Authenticates the user and returns a JWT token.

### Request Body

```json
{
  "usernameOrEmail": "john@example.com",
  "password": "password123"
}
```

### Successful Response (200)

```json
{
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "tokenType": "Bearer",
  "id": 1,
  "firstName": "john",
  "lastName": "doe",
  "email": "john@example.com",
  "username": "john",
  "role": "ATTENDEE",
  "roles": ["USER"],
  "permissions": ["events:view", "events:register", ...]
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `400 Bad Request` | Missing username/email or password |
| `401 Unauthorized` | Invalid credentials |

---

## Google OAuth Login

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/google` |

Authenticates the user via Google OAuth and returns a JWT token. Creates a new user if they don't exist.

### Request Body

```json
{
  "credential": "GOOGLE_ID_TOKEN"
}
```

### Successful Response (200)

```json
{
  "message": "Login successful via Google",
  "token": "JWT_TOKEN",
  "tokenType": "Bearer",
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "john@example.com",
  "role": "ATTENDEE",
  "roles": ["USER"],
  "permissions": ["events:view", "events:register", ...],
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "emailVerified": true,
  "provider": "google"
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `400 Bad Request` | Missing Google credential |
| `401 Unauthorized` | Invalid or expired Google token |

---

## Logout

| Method | Endpoint |
|--------|----------|
| POST | `/api/auth/logout` |

Logs out the authenticated user and invalidates the current JWT session. This endpoint invalidates the JWT by adding it to a server-side blacklist; once logged out, the same token can no longer be used to access protected APIs.

### Authentication

Requires a valid Bearer JWT in the `Authorization` header.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Body

None required.

### Successful Response (200)

```text
Logged out successfully
```

### Error Responses

| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing, malformed, invalid, or blacklisted token |

---

## Get User Profile

| Method | Endpoint |
|--------|----------|
| GET | `/api/users/profile` |

Returns the currently authenticated user's basic profile details from the JWT security context.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Successful Response (200)

```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "username": "john3163",
  "email": "john3163@example.com",
  "role": "CLIENT"
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `401 Unauthorized` | JWT token is missing, invalid, or expired |
| `404 Not Found` | Authenticated user could not be found |

#### Notes

- This endpoint is used to restore logged-in user/session state after refresh.
- The backend implementation is handled in the Eventra-Backend repository.

---

## Update User Profile

| Method | Endpoint |
|--------|----------|
| PUT | `/api/users/profile` |

Allows the currently authenticated user to update their profile information.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "firstName": "Johnny",
  "lastName": "Updated",
  "username": "johnny3164"
}
```

### Successful Response (200)

```json
{
  "id": 1,
  "firstName": "Johnny",
  "lastName": "Updated",
  "username": "johnny3164",
  "email": "john3164@example.com",
  "role": "CLIENT"
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Missing or invalid JWT token |
| `404 Not Found` | Authenticated user no longer exists |
| `409 Conflict` | Username already exists |

#### Notes

- Only `firstName`, `lastName`, and `username` can be updated through this endpoint.
- `id`, `email`, `password`, and `role` are not editable here.
- The backend uses the authenticated email from the JWT to identify the user.

---

# Event APIs

## Create Event

| Method | Endpoint |
|--------|----------|
| POST | `/api/events` |

Creates a new event. Requires JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Tech Conference 2026",
  "description": "Annual developer meetup featuring talks and workshops",
  "location": "Mumbai",
  "eventDate": "2026-08-15T10:00:00",
  "public": true
}
```

### Successful Response (201)

```json
{
  "id": 1,
  "title": "Tech Conference 2026",
  "description": "Annual developer meetup featuring talks and workshops",
  "location": "Mumbai",
  "eventDate": "2026-08-15T10:00:00",
  "public": true
}
```

### Error Response (401)

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/events",
  "timestamp": "2026-05-19T12:20:31"
}
```

### Error Response (409) — Event Full

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "This event has reached capacity.",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-23T09:30:00"
}
```

### Error Response (409) — Concurrent Registration Conflict

```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Too many simultaneous registrations. Please try again.",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-23T09:30:00"
}
```

---

## List Events

| Method | Endpoint |
|--------|----------|
| GET | `/api/events` |

Returns a list of all available events. No authentication required.

### Example Request

```bash
GET /api/events
```

### Successful Response (200)

```json
[
  {
    "id": 1,
    "title": "Tech Conference 2026",
    "description": "Annual developer meetup featuring talks and workshops",
    "location": "Mumbai",
    "eventDate": "2026-08-15T10:00:00",
    "public": true
  },
  {
    "id": 2,
    "title": "Open Source Hackathon",
    "description": "48-hour hackathon for open source projects",
    "location": "Bangalore",
    "eventDate": "2026-09-20T09:00:00",
    "public": true
  }
]
```

---

### Get Event By ID

---

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/{id}` |

Returns complete details for an event by its ID. Requires JWT authentication.

This endpoint retrieves the event directly by ID and does not apply public-only filtering. If the event exists, both public and private/non-public events can be returned to an authenticated requester.

### Request Headers

    Authorization: Bearer YOUR_JWT_TOKEN

### Example Request

    GET /api/events/1

### Successful Response (200)

```json
    {
      "id": 1,
      "title": "Tech Conference",
      "description": "Annual developer meetup",
      "location": "Mumbai",
      "eventDate": "2026-05-19T18:30:00",
      "public": false
    }
```

### Error Response (404)

```json
    {
      "status": 404,
      "error": "Not Found",
      "message": "Event not found with id: 888",
      "path": "/api/events/888",
      "timestamp": "2026-05-19T12:20:31"
    }
```

### Event Response Note

Event create, update, and detail APIs return a sanitized event response object instead of the raw backend entity. The response includes public event fields such as `id`, `title`, `description`, `location`, `eventDate`, `capacity`, `registeredCount`, and `public`.

Internal backend fields such as registered user entities, attendee details, and JPA metadata are not exposed in event API responses.

---

## Register for Event

| Method | Endpoint |
|--------|----------|
| POST | `/api/events/{id}/register` |

Registers the authenticated user for a specific event. Requires JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Example Request

```bash
POST /api/events/1/register
```

### Successful Response (200)

```json
{
  "message": "Successfully registered for event",
  "eventId": 1,
  "userId": 1
}
```

### Error Response (404)

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Event not found with id: 999",
  "path": "/api/events/999/register",
  "timestamp": "2026-05-19T12:20:31"
}
```

### Error Response (401)

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-19T12:20:31"
}
```

---

## My Registered Events

| Method | Endpoint |
|--------|----------|
| GET | `/api/users/my-events` |

Returns the events registered by the currently authenticated user. Requires JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example Request

```bash
GET /api/users/my-events
```

### Successful Response (200)

```json
[
  {
    "registrationId": 101,
    "eventId": 1,
    "title": "Tech Conference 2026",
    "description": "Annual developer meetup featuring talks and workshops",
    "location": "Mumbai",
    "eventDate": "2026-08-15T10:00:00",
    "date": "2026-08-15",
    "time": "10:00:00",
    "registeredAt": "2026-05-20T14:30:00",
    "status": "CONFIRMED"
  }
]
```

### Empty Response (200)

```json
[]
```

### Error Response (401)

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/users/my-events",
  "timestamp": "2026-05-27T12:20:31"
}
```

---

## Create Event

| Method | Endpoint |
|--------|----------|
| POST | `/api/events/create` |

Creates a new event. This endpoint is restricted to authenticated users with `ORGANIZER` or `ADMIN` authority.

### Authentication

---

Requires a valid JWT token.

```http
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "title": "Manual Create Event Test",
  "description": "Testing event creation manually",
  "location": "Online",
  "eventDate": "2026-07-15T10:00:00",
  "capacity": 50,
  "isPublic": true
}
```

#### Field Notes

- `title`, `description`, `location`, and `eventDate` are required.
- `eventDate` must be a future date/time.
- `capacity` is optional, but must be positive when provided.
- `isPublic` is optional and defaults to `true`.
- `registeredCount` is managed by the backend and defaults to `0`.

#### Success Response

```http
201 Created
```

```json
{
  "id": 1,
  "title": "Manual Create Event Test",
  "description": "Testing event creation manually",
  "location": "Online",
  "eventDate": "2026-07-15T10:00:00",
  "capacity": 50,
  "registeredCount": 0,
  "public": true
}
```

#### Error Responses

| Status | Reason |
|---|---|
| `400 Bad Request` | Invalid event payload |
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated user is not an `ORGANIZER` or `ADMIN` |

---

## Update Event

| Method | Endpoint |
|--------|----------|
| PUT | `/api/events/{id}` |

Updates an existing event by ID. This endpoint is restricted to authenticated users with `ORGANIZER` or `ADMIN` authority.

*This is a companion documentation update for backend issue #2099 and backend update-event API work.*

### Authentication

---

Requires a valid JWT token.

```http
Authorization: Bearer <token>
```

#### Request Body

```json
{
  "title": "Updated Event",
  "description": "Updated event description",
  "location": "Updated Location",
  "eventDate": "2026-12-30T10:00:00",
  "capacity": 150,
  "isPublic": true
}
```

#### Field Notes

- `registeredCount` is preserved during update and cannot be directly edited.
- `capacity` must not be lower than current `registeredCount`.
- Owner-only authorization is not enforced because the Event model currently does not track event ownership.

#### Success Response

```http
200 OK
```

#### Error Responses

| Status | Reason |
|---|---|
| `400 Bad Request` | Invalid payload |
| `403 Forbidden` | Unauthorized roles such as `CLIENT` |
| `404 Not Found` | Event ID does not exist |
| `409 Conflict` | Capacity is lower than current registeredCount |

---

## Delete Event

| Method | Endpoint |
|--------|----------|
| DELETE | `/api/events/{id}` |

Deletes an existing event by ID. This endpoint is restricted to authenticated users with `ADMIN` or `SUPER_ADMIN` authority.

### Authentication

---

Requires a valid JWT token.

```http
Authorization: Bearer <token>
```

#### Success Response

```http
204 No Content
```

#### Error Responses

| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT |
| `403 Forbidden` | Authenticated user does not have `ADMIN` or `SUPER_ADMIN` authority |
| `404 Not Found` | Event ID does not exist |

#### Additional Notes

- Related event registrations are automatically cleaned up by the backend before the event is deleted.

---

## Stream Event Updates (SSE)

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/stream` |

Opens a Server-Sent Events stream connection for event updates.

### Authentication

Public. No authentication required.

### Purpose

- This endpoint currently establishes a basic SSE connection.
- It sends an initial connected event to confirm the stream is active.
- It prepares the backend for future real-time event broadcasts.
- *Note: Full real-time event create/update/register broadcasting is not yet implemented.*

### Response Media Type

`text/event-stream`

### Manual Test Command

```bash
curl -N http://localhost:8080/api/events/stream
```

### Example Stream Output

```text
event:connected
data:Stream connected successfully

# Project APIs

## Submit Project

| Method | Endpoint |
|--------|----------|
| POST | `/api/projects` |

Submits a new project. Requires authentication with one of the following roles: `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Manual Test Project",
  "description": "Project created during manual backend verification.",
  "category": "Web Development",
  "thumbnailUrl": "https://example.com/project-thumbnail.png",
  "githubUrl": "https://github.com/example/manual-test-project"
}
```

- `title`: required
- `description`: required
- `category`: required
- `thumbnailUrl`: optional
- `githubUrl`: optional

### Successful Response (201)

```json
{
  "id": 1,
  "title": "Manual Test Project",
  "description": "Project created during manual backend verification.",
  "category": "Web Development",
  "thumbnailUrl": "https://example.com/project-thumbnail.png",
  "githubUrl": "https://github.com/example/manual-test-project",
  "upvotes": 0
}
```

### Error Responses

- **400 Bad Request**: Validation failure for required fields.
- **401 Unauthorized**: No token provided or token is invalid.
- **403 Forbidden**: Authenticated user does not have the required role (`ORGANIZER`, `ADMIN`, or `SUPER_ADMIN`).

---

## List Projects

| Method | Endpoint |
|--------|----------|
| GET | `/api/projects` |

Returns the list of projects for the Projects gallery/module.

*This documentation update corresponds to the backend implementation PR for `GET /api/projects`.*

### Authentication

Not required. Public endpoint.

### Example Request

```bash
GET /api/projects
```

### Success Response

Status: `200 OK`

Returns a JSON array of project objects. Returns `[]` if no projects exist.

#### Response Example

```json
[
  {
    "id": 1,
    "title": "Eventra Mobile App",
    "description": "A cross-platform mobile application for event management",
    "category": "Mobile Development",
    "thumbnailUrl": "https://example.com/thumbnail1.png",
    "githubUrl": "https://github.com/example/eventra-mobile",
    "upvotes": 42
  },
  {
    "id": 2,
    "title": "Eventra CLI Tool",
    "description": "Command-line tool for managing Eventra events",
    "category": "Developer Tools",
    "thumbnailUrl": "https://example.com/thumbnail2.png",
    "githubUrl": "https://github.com/example/eventra-cli",
    "upvotes": 15
  }
]
```

---

## Get Project By ID

| Method | Endpoint |
|--------|----------|
| GET | `/api/projects/{id}` |

Returns the details of a specific project by its ID.

### Authentication

Not required. Public endpoint.

### Success response example

```json
{
  "id": 1,
  "title": "Manual Test Project",
  "description": "Project detail API manual verification",
  "category": "Web Development",
  "thumbnailUrl": "https://example.com/project.png",
  "githubUrl": "https://github.com/example/project",
  "upvotes": 0
}
```

### Missing project response example

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Project not found with id: 999999",
  "path": "/api/projects/999999",
  "timestamp": "2026-05-30T02:01:54.6254625"
}
```

---

## Upvote Project

| Method | Endpoint |
|--------|----------|
| POST | `/api/projects/{id}/upvote` |

Increments the upvote count for a project by 1 and returns the updated project details.

### Authentication

Requires a valid Bearer JWT in the `Authorization` header. Any authenticated user can upvote.

### Success Response

Status: `200 OK`

#### Response Example

```json
{
  "id": 1,
  "title": "Manual Test Project",
  "description": "Project detail API manual verification",
  "category": "Web Development",
  "thumbnailUrl": "https://example.com/project.png",
  "githubUrl": "https://github.com/example/project",
  "upvotes": 1
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `401 Unauthorized` | JWT token is missing, invalid, or expired |
| `404 Not Found` | Project not found with the given ID |

---

## Get Project Categories

| Method | Endpoint |
|--------|----------|
| GET | `/api/projects/categories` |

Returns the static list of supported project categories used by the Projects gallery/module.

### Authentication

Not required. Public endpoint.

### Request

No request body.

### Success Response

Status: `200 OK`

#### Response example

```json
[
  "Mobile Development",
  "Web Development",
  "Developer Tools",
  "Machine Learning",
  "DevOps",
  "Design",
  "IoT",
  "Blockchain"
]
```

### Notes

- This endpoint is public and does not require JWT authentication.
- This PR only documents the project categories endpoint.
- Other Projects APIs will be documented separately when implemented.

---

# Hackathon APIs

*This documentation corresponds to the backend Hackathon API updates.*

## List Hackathons

| Method | Endpoint |
|--------|----------|
| GET | `/api/hackathons` |

Fetches the list of available hackathons.

### Authentication

Public. No authentication required.

### Example Request

```bash
curl http://localhost:8080/api/hackathons
```

### Successful Response (200)

Returns a JSON array of hackathon objects. Returns `[]` if no hackathons exist.

```json
[
  {
    "id": 1,
    "title": "Hackathon Name",
    "description": "Hackathon description",
    "organizer": "Organizer Name",
    "startDate": "2026-06-10",
    "endDate": "2026-06-12",
    "location": "Bhopal",
    "mode": "Offline",
    "prizePool": "50000",
    "registrationDeadline": "2026-06-05",
    "imageUrl": "https://example.com/hackathon.png"
  }
]
```

## Get Hackathon By ID

| Method | Endpoint |
|--------|----------|
| GET | `/api/hackathons/{id}` |

Returns complete details for a single hackathon by its ID.

*This documentation update corresponds to the backend implementation for GET /api/hackathons/{id}.*

### Authentication

Not required. Public endpoint.

### Example Request

```bash
GET /api/hackathons/1
```

### Successful Response (200)

```json
{
  "id": 1,
  "title": "CodeSprint 2026",
  "description": "A beginner-friendly hackathon for building full-stack projects.",
  "organizer": "Eventra Team",
  "startDate": "2026-07-10T00:00:00",
  "endDate": "2026-07-12T00:00:00",
  "location": "Bhopal",
  "mode": "Offline",
  "prizePool": "50000",
  "registrationDeadline": "2026-07-05T00:00:00",
  "imageUrl": "https://example.com/hackathon.png"
}
```

### Error Response (404)

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Hackathon not found with id: 999",
  "path": "/api/hackathons/999",
  "timestamp": "2026-06-02T02:41:32.8274901"
}
```

## Create Hackathon

| Method | Endpoint |
|--------|----------|
| POST | `/api/hackathons` |

Creates a new hackathon. Restricted to authorized roles: `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`.

### Authentication

Protected endpoint. Requires Bearer JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "title": "CodeSprint 2026",
  "description": "A beginner-friendly hackathon for building full-stack projects.",
  "organizer": "Eventra Team",
  "startDate": "2026-07-10T00:00:00",
  "endDate": "2026-07-12T00:00:00",
  "location": "Bhopal",
  "mode": "Offline",
  "prizePool": "50000",
  "registrationDeadline": "2026-07-05T00:00:00",
  "imageUrl": "https://example.com/hackathon.png"
}
```

- `title`: required
- `description`: required
- `organizer`: required
- `startDate`: required
- `endDate`: required
- `location`: required
- `mode`: required
- `registrationDeadline`: required
- `prizePool`: optional
- `imageUrl`: optional

### Successful Response (201)

```json
{
  "id": 1,
  "title": "CodeSprint 2026",
  "description": "A beginner-friendly hackathon for building full-stack projects.",
  "organizer": "Eventra Team",
  "startDate": "2026-07-10T00:00:00",
  "endDate": "2026-07-12T00:00:00",
  "location": "Bhopal",
  "mode": "Offline",
  "prizePool": "50000",
  "registrationDeadline": "2026-07-05T00:00:00",
  "imageUrl": "https://example.com/hackathon.png"
}
```

### Error Responses

- **400 Bad Request**: Validation errors for invalid payloads.
- **401 Unauthorized**: JWT is missing or invalid.
- **403 Forbidden**: Authenticated user does not have the required role (`ORGANIZER`, `ADMIN`, or `SUPER_ADMIN`).

## Update Hackathon

| Method | Endpoint |
|--------|----------|
| PUT | `/api/hackathons/{id}` |

Updates an existing hackathon by id. Restricted to authorized roles: `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`.

### Authentication

Protected endpoint. Requires Bearer JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Updated Hackathon",
  "description": "Updated hackathon description",
  "organizer": "IEEE OIST Updated",
  "startDate": "2026-10-10T10:00:00",
  "endDate": "2026-10-11T18:00:00",
  "location": "Bhopal",
  "mode": "Hybrid",
  "prizePool": "75000 INR",
  "registrationDeadline": "2026-10-01T23:59:59",
  "imageUrl": "https://example.com/updated.png"
}
```

- `title`: required
- `description`: required
- `organizer`: required
- `startDate`: required
- `endDate`: required
- `location`: required
- `mode`: required
- `registrationDeadline`: required
- `prizePool`: optional
- `imageUrl`: optional

### Successful Response (200)

```json
{
  "id": 2,
  "title": "Updated Hackathon",
  "description": "Updated hackathon description",
  "organizer": "IEEE OIST Updated",
  "startDate": "2026-10-10T10:00:00",
  "endDate": "2026-10-11T18:00:00",
  "location": "Bhopal",
  "mode": "Hybrid",
  "prizePool": "75000 INR",
  "registrationDeadline": "2026-10-01T23:59:59",
  "imageUrl": "https://example.com/updated.png"
}
```

### Error Responses

- **400 Bad Request**: Validation errors for invalid payloads.
- **401 Unauthorized**: JWT is missing or invalid.
- **403 Forbidden**: Authenticated user does not have the required role (`ORGANIZER`, `ADMIN`, or `SUPER_ADMIN`).
- **404 Not Found**: Hackathon id does not exist.

## Delete Hackathon

| Method | Endpoint |
|--------|----------|
| DELETE | `/api/hackathons/{id}` |

Deletes an existing hackathon by id. Restricted to authorized roles: `ADMIN`, `SUPER_ADMIN`.

### Authentication

Protected endpoint. Requires Bearer JWT authentication.

### Path Parameter

- `id`: Long, hackathon id

### Successful Response (204)

No response body.

### Error Responses

- **401 Unauthorized**: JWT is missing or invalid.
- **403 Forbidden**: Authenticated user does not have the required role (`ADMIN` or `SUPER_ADMIN`).
- **404 Not Found**: Hackathon id does not exist.

## Register for Hackathon

| Method | Endpoint |
|--------|----------|
| POST | `/api/hackathons/{id}/register` |

Registers the authenticated user for a hackathon by id.

### Authentication

Protected endpoint. Requires Bearer JWT authentication. Any authenticated user can register.

### Path Parameter

- `id`: Long, hackathon id

### Request Body

No request body required.

### Successful Response (201)

```json
{
  "registrationId": 1,
  "hackathonId": 1,
  "hackathonTitle": "Manual Register Test Hackathon",
  "userEmail": "hackregisteruser@example.com",
  "registeredAt": "2026-06-04T23:50:18.742152",
  "status": "CONFIRMED"
}
```

### Error Responses

- **400 Bad Request**: Registration deadline has passed / registration is closed.
- **401 Unauthorized**: JWT is missing or invalid.
- **404 Not Found**: Hackathon id does not exist.
- **409 Conflict**: User is already registered for the hackathon.

*Note: The backend implementation is handled in the Eventra-Backend repository. This docs PR only syncs API documentation with the backend behavior.*

---

# Feedback APIs

## Submit Feedback

| Method | Endpoint |
|--------|----------|
| POST | `/api/feedback` |

This endpoint allows an authenticated user to submit feedback for an event they are registered for. The backend validates the event, authenticated user, and event registration before saving feedback. Duplicate feedback from the same user for the same event is rejected.

### Authentication

Requires a valid Bearer JWT in the `Authorization` header. Any authenticated user can submit feedback, but the user must be registered for the event.

### Request Body

```json
{
  "eventId": 1,
  "rating": 5,
  "comment": "Great event!"
}
```

### Request Validation

- `eventId` is required
- `rating` is required and must be between `1` and `5`
- `comment` is optional and can be up to `1000` characters

### Successful Response (201)

```json
{
  "id": 1,
  "eventId": 1,
  "userId": 1,
  "rating": 5,
  "comment": "Great event!",
  "submittedAt": "2026-06-07T18:06:22.334156"
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `400 Bad Request` | Invalid request body or validation failure |
| `401 Unauthorized` | If the request is unauthenticated |
| `403 Forbidden` | If the authenticated user is not registered for the event |
| `404 Not Found` | If the event or authenticated user does not exist |
| `409 Conflict` | If the user has already submitted feedback for the event |

---

# Notification APIs

## Get Notifications

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | `/api/notifications` |

Returns the authenticated user’s notifications sorted by newest first.

### Authentication

Requires Bearer JWT authentication.

### Success Response

Status: `200 OK`

```json
[
  {
    "id": 1,
    "title": "Welcome Notification",
    "message": "This is a manual test notification.",
    "read": false,
    "createdAt": "2026-06-09T00:38:52.335113"
  }
]
```

### Empty Response

If the authenticated user has no notifications:

```json
[]
```

### Notes

- Only notifications belonging to the authenticated user are returned.
- The response includes read/unread status using the `read` field.
- Notifications are returned in newest-first order.
- Pagination is not currently included.

---

# Analytics APIs

## Get Admin Analytics

| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/analytics` |

Returns high-level system analytics and dashboard statistics.

*This documentation update corresponds to the backend implementation for GET /api/admin/analytics.*

### Authentication

Requires a valid Bearer JWT in the `Authorization` header. This endpoint is restricted to users with `ADMIN`, `ORGANIZER`, or `SUPER_ADMIN` roles.

### Successful Response (200)

```json
{
  "monthlyRegistrations": [
    { "month": "Jan", "count": 120 },
    { "month": "Feb", "count": 150 }
  ],
  "categoryBreakdown": [
    { "category": "Technology", "count": 20 },
    { "category": "Design", "count": 8 }
  ],
  "registrationTrend": "up",
  "topEvents": [
    { "id": 1, "title": "Tech Conference 2026", "participants": 300 }
  ]
}
```

### Error Responses

| Status | Reason |
|--------|--------|
| `401 Unauthorized` | JWT token is missing, invalid, or expired |
| `403 Forbidden` | Authenticated user does not have the required administrative role |

---

# Structured Error Responses

The backend returns standardized JSON error responses for better frontend integration and debugging.

## Example 404 Response

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Event not found with id: 888",
  "path": "/api/events/888",
  "timestamp": "2026-05-19T12:20:31"
}
```

---

# Common HTTP Status Codes

| Status Code | Meaning |
|-------------|----------|
| 200 | Successful request |
| 201 | Resource created successfully |
| 400 | Validation error / Bad request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |

---

# Frontend Integration Notes

Frontend applications should:

- Store JWT tokens securely
- Send tokens using the `Authorization` header
- Handle structured API error responses
- Use Swagger UI for endpoint testing during development

Example authorization header:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# Benefits of Swagger Integration

- Interactive API testing
- Faster frontend-backend integration
- Better onboarding for contributors
- Centralized API reference
- Easier debugging and maintenance
- Improved development workflow
