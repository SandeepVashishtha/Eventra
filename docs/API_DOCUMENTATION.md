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

## Get Public Event By ID

| Method | Endpoint |
|--------|----------|
| GET | `/api/events/{id}` |

Returns a public event if available.

### Example Request

```bash
GET /api/events/1
```

### Successful Response

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