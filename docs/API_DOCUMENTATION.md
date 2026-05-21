# Eventra API Documentation

## Overview

Eventra provides a RESTful backend API built using Spring Boot and secured using JWT Authentication.

The APIs support:

- User authentication
- Event management
- Public and protected endpoint access
- Structured error handling
- Swagger/OpenAPI integration

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

## Get Public Event By ID

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/{id}` |

Returns a public event if available.

### Example Request

```bash
GET /api/events/1
```

### Successful Response (200)

```json
{
  "id": 1,
  "title": "Tech Conference",
  "description": "Annual developer meetup",
  "location": "Mumbai",
  "eventDate": "2026-05-19T18:30:00",
  "public": true
}
```

### Error Response (404)

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Event not found or is not public with id: 888",
  "path": "/api/events/888",
  "timestamp": "2026-05-19T12:20:31"
}
```

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
  "message": "Event not found or is not public with id: 888",
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