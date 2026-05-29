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

# Project APIs

## Submit Project

| Method | Endpoint |
|--------|----------|
| POST | `/api/projects` |

Submits a new project. Requires JWT authentication.

### Request Headers

```bash
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Eventra Mobile App",
  "description": "A cross-platform mobile application for event management",
  "category": "Mobile Development",
  "repositoryUrl": "https://github.com/example/eventra-mobile"
}
```

### Successful Response (201)

```json
{
  "id": 1,
  "title": "Eventra Mobile App",
  "description": "A cross-platform mobile application for event management",
  "category": "Mobile Development",
  "repositoryUrl": "https://github.com/example/eventra-mobile",
  "submittedBy": "john@example.com"
}
```

### Error Response (401)

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/projects",
  "timestamp": "2026-05-19T12:20:31"
}
```

---

## List Projects

| Method | Endpoint |
|--------|----------|
| GET | `/api/projects` |

Returns a list of all submitted projects. No authentication required.

### Example Request

```bash
GET /api/projects
```

### Successful Response (200)

```json
[
  {
    "id": 1,
    "title": "Eventra Mobile App",
    "description": "A cross-platform mobile application for event management",
    "category": "Mobile Development",
    "repositoryUrl": "https://github.com/example/eventra-mobile",
    "submittedBy": "john@example.com"
  },
  {
    "id": 2,
    "title": "Eventra CLI Tool",
    "description": "Command-line tool for managing Eventra events",
    "category": "Developer Tools",
    "repositoryUrl": "https://github.com/example/eventra-cli",
    "submittedBy": "jane@example.com"
  }
]
```

---

## Get Project Categories

| Method | Endpoint |
|--------|----------|
| GET | `/api/projects/categories` |

Returns a list of available project categories. No authentication required.

### Example Request

```bash
GET /api/projects/categories
```

### Successful Response (200)

```json
[
  "Mobile Development",
  "Web Development",
  "Developer Tools",
  "Machine Learning",
  "DevOps",
  "Design"
]
```

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
