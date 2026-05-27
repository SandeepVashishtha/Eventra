# Eventra — Backend API Requirements
> **For the Spring Boot Backend Team**
> Derived from full analysis of the React frontend source code.
> Last Updated: 2026-05-25

---

## Table of Contents

1. [Overview & Tech Stack](#1-overview--tech-stack)
2. [Base URL & Environment](#2-base-url--environment)
3. [Authentication & Security](#3-authentication--security)
4. [Roles & Permissions Model](#4-roles--permissions-model)
5. [Standard Response & Error Format](#5-standard-response--error-format)
6. [Auth APIs](#6-auth-apis)
7. [Events APIs](#7-events-apis)
8. [Event Registration APIs](#8-event-registration-apis)
9. [Hackathon APIs](#9-hackathon-apis)
10. [Project (Gallery) APIs](#10-project-gallery-apis)
11. [User & Profile APIs](#11-user--profile-apis)
12. [Notifications APIs](#12-notifications-apis)
13. [Admin APIs](#13-admin-apis)
14. [Leaderboard & Achievements APIs](#14-leaderboard--achievements-apis)
15. [Feedback APIs](#15-feedback-apis)
16. [Real-Time / SSE APIs](#16-real-time--sse-apis)
17. [CORS & Headers Configuration](#17-cors--headers-configuration)
18. [Pagination Convention](#18-pagination-convention)
19. [Data Model Reference](#19-data-model-reference)

---

## 1. Overview & Tech Stack

**Project:** Eventra — Event Management Platform  
**Frontend:** React 18 (Create React App) with Tailwind CSS  
**Backend (this document):** Spring Boot + Java, MySQL / H2 DB  
**Auth:** JWT Bearer Token  
**API Style:** RESTful JSON  

The frontend calls all APIs via an Axios instance configured with:
- Base URL: `process.env.REACT_APP_API_URL` (defaults to `http://localhost:8080`)
- `Content-Type: application/json`
- `withCredentials: true`
- Request timeout: 15 seconds
- Auto-retry on 502, 503, 504 (once, after 1 second)

---

## 2. Base URL & Environment

| Environment | Base URL |
|-------------|----------|
| Local Dev | `http://localhost:8080` |
| Production | `https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net` |

All API routes are prefixed with `/api`.

---

## 3. Authentication & Security

### JWT Token
- Tokens are issued on login/signup.
- The frontend stores tokens in `localStorage` under the key `token`.
- All protected endpoints require the header:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- On a `401` response, the frontend automatically clears the session and redirects to `/login`.
- The frontend decodes the JWT `exp` claim to detect expiry client-side.

### Google OAuth
- The frontend uses `@react-oauth/google` to get a Google credential (ID token).
- This credential is sent to the backend for verification and session creation.
- Endpoint: `POST /api/auth/google`

### Session Behavior
- Backend must return the JWT token in the **response body** (under `token` or `accessToken`), OR in the `Authorization` response header as `Bearer <token>`.
- On signup, the backend must return the user object **and** token.

---

## 4. Roles & Permissions Model

> **📖 For comprehensive details on RBAC, role hierarchy, permission scopes, and access control patterns, see the [Architecture & Roles Guide](ARCHITECTURE_AND_ROLES.md#-role-based-access-control-rbac).**

### Roles (from `src/config/roles.js`)
| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full system access |
| `ADMIN` | Manage events, users, analytics, content |
| `ORGANIZER` | Create/edit events and hackathons, view analytics |
| `VOLUNTEER` | Moderate content |
| `ATTENDEE` | View and register for events |

> **Note:** The backend may return `EVENT_MANAGER` as a role — the frontend normalizes this to `ORGANIZER` automatically.

### Permissions
| Permission | Granted To |
|------------|-----------|
| `CREATE_EVENT` | SUPER_ADMIN, ADMIN, ORGANIZER |
| `EDIT_EVENT` | SUPER_ADMIN, ADMIN, ORGANIZER |
| `DELETE_EVENT` | SUPER_ADMIN, ADMIN |
| `HOST_HACKATHON` | SUPER_ADMIN, ADMIN, ORGANIZER |
| `MANAGE_USERS` | SUPER_ADMIN, ADMIN |
| `VIEW_ANALYTICS` | SUPER_ADMIN, ADMIN, ORGANIZER |
| `MODERATE_CONTENT` | SUPER_ADMIN, ADMIN, VOLUNTEER |
| `EDIT_USER` | SUPER_ADMIN |
| `DELETE_USER` | SUPER_ADMIN |

The backend should enforce these permissions via Spring Security and return them in the login/profile response under the `permissions` array field.

---

## 5. Standard Response & Error Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success"
}
```
> Simple responses may return the object directly without a wrapper.

### Error Response (Standardized)
The frontend reads `error.response.data.message` or `error.response.data.error`.
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Human-readable error message here",
  "path": "/api/auth/login",
  "timestamp": "2026-05-25T12:00:00"
}
```

### HTTP Status Code Guide
| Status | Meaning |
|--------|---------|
| `200` | OK — request successful |
| `201` | Created — resource created successfully |
| `204` | No Content — deletion or mark-read success |
| `400` | Bad Request — validation failure |
| `401` | Unauthorized — invalid/missing/expired JWT |
| `403` | Forbidden — authenticated but insufficient permissions |
| `404` | Not Found — resource does not exist |
| `409` | Conflict — duplicate resource, capacity exceeded, concurrent conflict |
| `500` | Internal Server Error |
| `502/503/504` | Gateway/Service errors (frontend will retry once) |

---

> Swagger/OpenAPI documentation is available at:
>
> ```bash
> /swagger-ui/index.html
> ```
>
> Protected endpoints in Swagger display a lock icon and require JWT authorization using:
>
> ```bash
> Authorization: Bearer <JWT_TOKEN>
> ```
>
> Developers can use the Swagger "Authorize" button to test secured APIs directly from the browser.


## 6. Auth APIs

### 6.1 Register / Signup

```
POST /api/auth/signup
```

**Auth Required:** No  
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123"
}
```

**Frontend Validation Rules (backend must also enforce):**
- `firstName`: required, 2–50 characters
- `lastName`: required, 2–50 characters
- `email`: required, valid email format
- `password`: required, min 8 chars, must have uppercase, lowercase, digit, and special character (all 5 criteria)
- `confirmPassword`: must match `password`

**Success Response `201`:**
```json
{
  "token": "eyJhbGci...",
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "john@example.com",
  "role": "ATTENDEE",
  "roles": ["ATTENDEE"],
  "permissions": []
}
```

**Error Responses:**
- `400` — Validation failure (missing fields, password mismatch)
- `409` — Email already registered

---

### 6.2 Login

```
POST /api/auth/login
```

**Auth Required:** No  
**Request Body:**
```json
{
  "usernameOrEmail": "john@example.com",
  "password": "SecurePass@123"
}
```
> `usernameOrEmail` accepts both a username and an email address.

**Success Response `200`:**
```json
{
  "token": "eyJhbGci...",
  "tokenType": "Bearer",
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "john",
  "role": "ATTENDEE",
  "roles": ["ATTENDEE"],
  "permissions": []
}
```

**Error Responses:**
- `400` — Missing fields
- `401` — Invalid credentials

---

### 6.3 Google OAuth Login

```
POST /api/auth/google
```

**Auth Required:** No  
**Request Body:**
```json
{
  "credential": "<Google ID Token JWT>"
}
```

**Success Response `200`:** Same shape as login response.  
**Error Responses:** `400` — Invalid or missing credential

---

### 6.4 Logout

```
POST /api/auth/logout
```

**Auth Required:** Yes (Bearer Token)  
**Request Body:** None  
**Success Response `200`:**
```json
{
  "message": "Logged out successfully"
}
```
> The frontend also clears localStorage on logout regardless of backend response.

---

### 6.5 Password Reset

```
POST /api/auth/reset-password
```

**Auth Required:** No  
**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response `200`:**
```json
{
  "message": "Password reset email sent successfully"
}
```

---

## 7. Events APIs

### 7.1 List All Events

```
GET /api/events
```

**Auth Required:** No (public)  
**Query Parameters (recommended for filtering & pagination):**

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number (0-indexed) |
| `size` | int | Items per page (default: 10) |
| `category` | string | Filter by category |
| `status` | string | `upcoming`, `ongoing`, `completed` |
| `search` | string | Search by title/description |
| `type` | string | `Event` or `Hackathon` |

**Success Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Tech Conference 2026",
    "description": "Annual developer meetup",
    "location": "Mumbai",
    "date": "2026-08-15",
    "time": "10:00 AM",
    "eventDate": "2026-08-15T10:00:00",
    "category": "Technology",
    "type": "Event",
    "status": "upcoming",
    "image": "https://...",
    "attendees": 45,
    "maxAttendees": 200,
    "public": true,
    "organizerId": 5,
    "tags": ["AI", "Tech"]
  }
]
```

---

### 7.2 Get Event by ID

```
GET /api/events/{id}
```

**Auth Required:** No (for public events)  
**Success Response `200`:** Single event object (same shape as list item)  
**Error `404`:** Event not found

---

### 7.3 Create Event

```
POST /api/events/create
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER`, `SUPER_ADMIN`  
**Request Body:**
```json
{
  "title": "Tech Conference 2026",
  "description": "Annual developer meetup featuring talks and workshops",
  "location": "Mumbai",
  "date": "2026-08-15",
  "time": "10:00 AM",
  "eventDate": "2026-08-15T10:00:00",
  "category": "Technology",
  "type": "Event",
  "maxAttendees": 200,
  "public": true,
  "image": "https://...",
  "tags": ["AI", "Tech"]
}
```

**Success Response `201`:** Created event object  
**Error Responses:**
- `400` — Validation error
- `401` — Unauthorized
- `403` — Insufficient permissions

---

### 7.4 Update Event

```
PUT /api/events/{id}
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER`
**Description:** Updates an existing event. Companion update for issue #2099.
**Request Body:**
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

**Field Constraints:**
- `registeredCount` is preserved and cannot be directly edited.
- `capacity` cannot be reduced below current `registeredCount`.
- Owner-only authorization is not enforced as the Event model currently lacks ownership tracking.

**Success Response `200`:** Updated event object
**Error Responses:**
- `400` — Invalid payload
- `403` — Forbidden (e.g., CLIENT role)
- `404` — Event not found
- `409` — Conflict (capacity < registeredCount)

---

### 7.5 Delete Event

```
DELETE /api/events/{id}
```

**Auth Required:** Yes — Roles: `ADMIN`, `SUPER_ADMIN`  
**Success Response `204`:** No content  
**Error `404`:** Event not found

---

### 7.6 Check Event Capacity / Availability

```
GET /api/events/{id}/availability
```

**Auth Required:** No  
**Success Response `200`:**
```json
{
  "eventId": 1,
  "maxAttendees": 200,
  "currentAttendees": 145,
  "available": true,
  "spotsLeft": 55
}
```
The availability response schema is fully documented in Swagger/OpenAPI and includes:

* Event capacity
* Current registered count
* Remaining spots
* Full/available status

This allows frontend developers to understand response fields directly from Swagger UI without inspecting backend source code.


---

## 8. Event Registration APIs

### 8.1 Register for an Event

```
POST /api/events/{id}/register
```

**Auth Required:** Yes (Bearer Token) — Roles: any authenticated user  
**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "organization": "Acme Corp",
  "designation": "Software Engineer",
  "additionalInfo": "Vegetarian meal preference",
  "eventId": 1,
  "userId": 42
}
```

**Field Requirements:**
| Field | Required | Validation |
|-------|----------|-----------|
| `fullName` | Yes | Min 3 characters |
| `email` | Yes | Valid email format |
| `phone` | Yes | 7–20 digits, optional `+`, spaces, hyphens |
| `organization` | No | Optional |
| `designation` | No | Optional |
| `additionalInfo` | No | Optional, max 500 chars |
| `eventId` | Yes | Must match path param |
| `userId` | No | ID of authenticated user |

**Success Response `200`:**
```json
{
  "message": "Successfully registered for event",
  "eventId": 1,
  "userId": 42,
  "registrationId": "REG-001"
}
```

**Error Responses:**
- `401` — Unauthorized
- `404` — Event not found
- `409 (Conflict - Event Full)`:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "This event has reached capacity.",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-25T12:00:00"
}
```
- `409 (Conflict - Duplicate Registration)`:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "You have already registered for this event.",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-25T12:00:00"
}
```
- `409 (Conflict - Concurrent)`:
```json
{
  "status": 409,
  "error": "Conflict",
  "message": "Too many simultaneous registrations. Please try again.",
  "path": "/api/events/1/register",
  "timestamp": "2026-05-25T12:00:00"
}
```

> ⚠️ **Important:** The backend must handle concurrent registrations atomically (e.g., using database-level locking or optimistic concurrency). The frontend does client-side lock detection, but the backend is the final authority.

---

### 8.2 Get User's Registered Events

```
GET /api/users/my-events
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
[
  {
    "eventId": 1,
    "title": "Tech Conference 2026",
    "date": "2026-08-15",
    "time": "10:00 AM",
    "location": "Mumbai",
    "registeredAt": "2026-05-20T14:30:00"
  }
]
```

---

## 9. Hackathon APIs

### 9.1 List Hackathons

```
GET /api/hackathons
```

**Auth Required:** No (public)  
**Query Parameters:** Same as events (page, size, search, status)  
**Success Response `200`:** Array of hackathon objects

---

### 9.2 Get Hackathon by ID

```
GET /api/hackathons/{id}
```

**Auth Required:** No  
**Success Response `200`:** Single hackathon object  
**Error `404`:** Hackathon not found

---

### 9.3 Create / Host Hackathon

```
POST /api/hackathons
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER`, `SUPER_ADMIN`  
**Request Body:**
```json
{
  "hackathonName": "Global AI Hackathon 2026",
  "organizerName": "TechOrg Inc.",
  "email": "organizer@techorg.com",
  "startDate": "2026-09-01",
  "endDate": "2026-09-03",
  "description": "A 48-hour hackathon focused on AI solutions for climate change...",
  "location": "Online",
  "participantLimit": 500,
  "prizeDetails": "First Place: $5000, Second: $2000, Third: $1000",
  "website": "https://hackathon.techorg.com"
}
```

**Field Requirements:**
| Field | Required | Validation |
|-------|----------|-----------|
| `hackathonName` | Yes | Min 3 characters |
| `organizerName` | Yes | Min 3 characters |
| `email` | Yes | Valid email |
| `startDate` | Yes | Cannot be in the past (`YYYY-MM-DD`) |
| `endDate` | Yes | Cannot be before `startDate` |
| `description` | Yes | Min 20 characters |
| `location` | Yes | Min 3 characters |
| `participantLimit` | No | Positive integer |
| `prizeDetails` | No | Text description |
| `website` | No | Valid URL |

**Success Response `201`:** Created hackathon object  
**Error Responses:**
- `400` — Validation errors
- `401` — Unauthorized
- `403` — Insufficient permissions

---

### 9.4 Update Hackathon

```
PUT /api/hackathons/{id}
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER` (own), `SUPER_ADMIN`  
**Request Body:** Same as create  
**Success Response `200`:** Updated hackathon object

---

### 9.5 Delete Hackathon

```
DELETE /api/hackathons/{id}
```

**Auth Required:** Yes — Roles: `ADMIN`, `SUPER_ADMIN`  
**Success Response `204`:** No content

---

### 9.6 Register for Hackathon

```
POST /api/hackathons/{id}/register
```

**Auth Required:** Yes  
**Request Body:** Same as event registration  
**Success Response `200`:** Registration confirmation

---

## 10. Project (Gallery) APIs

### 10.1 List All Projects

```
GET /api/projects
```

**Auth Required:** No (public)  
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category |
| `search` | string | Search by title |
| `page` | int | Page number |
| `size` | int | Items per page |

**Success Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Eventra Mobile App",
    "description": "A cross-platform mobile app for event management",
    "category": "Mobile Development",
    "repositoryUrl": "https://github.com/example/project",
    "demoUrl": "https://demo.example.com",
    "techStack": ["React Native", "Spring Boot"],
    "submittedBy": "john@example.com",
    "submittedAt": "2026-05-10T09:00:00",
    "upvotes": 24,
    "thumbnailUrl": "https://..."
  }
]
```

---

### 10.2 Get Project by ID

```
GET /api/projects/{id}
```

**Auth Required:** No  
**Success Response `200`:** Single project object  
**Error `404`:** Project not found

---

### 10.3 Submit Project

```
POST /api/projects
```

**Auth Required:** Yes  
**Request Body:**
```json
{
  "title": "Eventra Mobile App",
  "description": "A cross-platform mobile application for event management",
  "category": "Mobile Development",
  "repositoryUrl": "https://github.com/example/eventra-mobile",
  "demoUrl": "https://demo.example.com",
  "techStack": ["React Native", "Spring Boot"],
  "thumbnailUrl": "https://..."
}
```

**Success Response `201`:** Submitted project object  
**Error `401`:** Unauthorized

---

### 10.4 Get Project Categories

```
GET /api/projects/categories
```

**Auth Required:** No  
**Success Response `200`:**
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

---

### 10.5 Upvote a Project

```
POST /api/projects/{id}/upvote
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
{
  "projectId": 1,
  "upvotes": 25,
  "hasUpvoted": true
}
```

---

## 11. User & Profile APIs

### 11.1 Get Current User Profile

```
GET /api/users/profile
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
{
  "id": 42,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "role": "ATTENDEE",
  "roles": ["ATTENDEE"],
  "permissions": [],
  "bio": "Software developer based in Mumbai",
  "avatarUrl": "https://...",
  "createdAt": "2025-01-15T10:00:00",
  "status": "Active"
}
```

---

### 11.2 Update User Profile

```
PUT /api/users/profile
```

**Auth Required:** Yes  
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "avatarUrl": "https://..."
}
```

**Success Response `200`:** Updated user profile object

---

### 11.3 Get User Achievements

```
GET /api/users/achievements
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
{
  "totalEvents": 12,
  "currentStreak": 3,
  "badges": [
    {
      "id": "first-event",
      "name": "First Event",
      "description": "Registered for your first event",
      "earnedAt": "2025-02-01T10:00:00",
      "iconUrl": "https://..."
    }
  ],
  "points": 450,
  "rank": 12
}
```

---

### 11.4 Admin — Get All Users

```
GET /api/admin/users
```

**Auth Required:** Yes — Roles: `ADMIN`, `SUPER_ADMIN`  
**Query Parameters:** `page`, `size`, `search`, `status`, `role`  
**Success Response `200`:**
```json
[
  {
    "id": 1,
    "firstName": "Aarav",
    "lastName": "Sharma",
    "email": "aarav@example.com",
    "roles": ["ATTENDEE"],
    "status": "Active",
    "createdAt": "2025-01-15"
  }
]
```

---

### 11.5 Admin — Update User

```
PUT /api/admin/users/{id}
```

**Auth Required:** Yes — Roles: `SUPER_ADMIN`  
**Request Body:**
```json
{
  "roles": ["ORGANIZER"],
  "status": "Active"
}
```
**Success Response `200`:** Updated user object

---

### 11.6 Admin — Delete User

```
DELETE /api/admin/users/{id}
```

**Auth Required:** Yes — Roles: `SUPER_ADMIN`  
**Success Response `204`:** No content

---

## 12. Notifications APIs

> The frontend polls this endpoint every **60 seconds** while the user is logged in.

### 12.1 Get All Notifications

```
GET /api/notifications
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Registration Confirmed",
    "message": "You have been registered for Tech Conference 2026",
    "type": "registration",
    "isRead": false,
    "createdAt": "2026-05-20T14:30:00",
    "eventId": 1
  },
  {
    "id": 2,
    "title": "Event Reminder",
    "message": "Tech Conference 2026 starts tomorrow!",
    "type": "reminder",
    "isRead": true,
    "createdAt": "2026-08-14T09:00:00",
    "eventId": 1
  }
]
```

**Notification types:** `registration`, `reminder`, `announcement`, `achievement`, `system`

---

### 12.2 Mark Notification as Read

```
PUT /api/notifications/{id}/read
```

**Auth Required:** Yes  
**Request Body:** `{}` (empty)  
**Success Response `200`:**
```json
{
  "message": "Notification marked as read",
  "notificationId": 1
}
```

---

### 12.3 Mark All Notifications as Read

```
PUT /api/notifications/read-all
```

**Auth Required:** Yes  
**Request Body:** None  
**Success Response `200`:**
```json
{
  "message": "All notifications marked as read"
}
```

---

## 13. Admin APIs

### 13.1 Admin Dashboard Stats

```
GET /api/admin/stats
```

**Auth Required:** Yes — Roles: `ADMIN`, `SUPER_ADMIN`  
**Success Response `200`:**
```json
{
  "totalUsers": 1500,
  "activeUsers": 1200,
  "inactiveUsers": 300,
  "totalEvents": 48,
  "upcomingEvents": 12,
  "completedEvents": 36,
  "totalParticipants": 8500,
  "avgParticipantsPerEvent": 177,
  "totalHackathons": 15,
  "totalProjects": 89
}
```

---

### 13.2 Admin — Get All Events

```
GET /api/admin/events
```

**Auth Required:** Yes — Roles: `ADMIN`, `SUPER_ADMIN`  
**Query Parameters:** `page`, `size`, `search`, `status`, `type`  
**Success Response `200`:** Array of event objects with full detail

---

### 13.3 Analytics Data

```
GET /api/admin/analytics
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER`, `SUPER_ADMIN`  
**Success Response `200`:**
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

---

## 14. Leaderboard & Achievements APIs

### 14.1 Get Leaderboard

```
GET /api/leaderboard
```

**Auth Required:** No (public)  
**Query Parameters:** `page`, `size`, `period` (`all-time`, `monthly`, `weekly`)  
**Success Response `200`:**
```json
[
  {
    "rank": 1,
    "userId": 42,
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://...",
    "points": 1500,
    "eventsAttended": 24,
    "badges": 8,
    "streak": 5
  }
]
```

---

### 14.2 Get User Rank

```
GET /api/leaderboard/me
```

**Auth Required:** Yes  
**Success Response `200`:**
```json
{
  "rank": 12,
  "points": 450,
  "totalUsers": 1500
}
```

---

## 15. Feedback APIs

### 15.1 Submit Event Feedback

```
POST /api/feedback
```

**Auth Required:** Yes  
**Request Body:**
```json
{
  "eventId": 1,
  "rating": 5,
  "comment": "Excellent event, well organized!",
  "categories": {
    "organization": 5,
    "content": 4,
    "venue": 5
  }
}
```

**Success Response `201`:**
```json
{
  "id": 1,
  "eventId": 1,
  "userId": 42,
  "rating": 5,
  "comment": "Excellent event!",
  "submittedAt": "2026-08-16T10:00:00"
}
```

---

### 15.2 Get Feedback for an Event

```
GET /api/feedback/event/{eventId}
```

**Auth Required:** Yes — Roles: `ADMIN`, `ORGANIZER` (own events)  
**Success Response `200`:** Array of feedback objects

---

## 16. Real-Time / SSE APIs

The frontend has a `RealTimeContext.js` referencing real-time updates. The `sse-mock-server.js` file at the project root simulates SSE events.

### 16.1 Server-Sent Events Stream

```
GET /api/events/stream
```

**Auth Required:** Yes (token in query param or header)  
**Content-Type:** `text/event-stream`  
**Events pushed from server:**
```
event: notification
data: {"type": "new_registration", "eventId": 1, "count": 146}

event: event_update
data: {"eventId": 1, "field": "attendees", "value": 146}

event: announcement
data: {"message": "New event added!", "eventId": 5}
```

---

## 17. CORS & Headers Configuration

The frontend runs on:
- Local: `http://localhost:3000`
- Production: `https://eventra.sandeepvashishtha.in`

The Spring Boot backend must configure CORS to allow:
```
Access-Control-Allow-Origin: http://localhost:3000, https://eventra.sandeepvashishtha.in
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

> `withCredentials: true` is set on the Axios instance — this requires the backend to explicitly allow credentials.

---

## 18. Pagination Convention

The frontend expects either:
1. A plain array (no pagination wrapper), **OR**
2. A paginated object:
```json
{
  "content": [ ... ],
  "totalElements": 150,
  "totalPages": 15,
  "currentPage": 0,
  "size": 10
}
```

Please agree on and document which format you will use before implementation.

---

## 19. Data Model Reference

### User Object
| Field | Type | Notes |
|-------|------|-------|
| `id` | Long | Unique user ID |
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Unique, required |
| `username` | String | Unique |
| `role` | String | Primary role enum |
| `roles` | String[] | All roles array |
| `permissions` | String[] | Permission list |
| `status` | String | `Active` / `Inactive` |
| `avatarUrl` | String | Optional profile image |
| `bio` | String | Optional bio |
| `createdAt` | ISO DateTime | Account creation time |

### Event Object
| Field | Type | Notes |
|-------|------|-------|
| `id` | Long | Unique event ID |
| `title` | String | Required |
| `description` | String | Required |
| `location` | String | Required |
| `date` | String | `YYYY-MM-DD` |
| `time` | String | e.g., `10:00 AM` |
| `eventDate` | ISO DateTime | Combined date/time |
| `category` | String | Event category |
| `type` | String | `Event` or `Hackathon` |
| `status` | String | `upcoming`, `ongoing`, `completed` |
| `image` | String | Cover image URL |
| `attendees` | Integer | Current registrants |
| `maxAttendees` | Integer | Capacity |
| `public` | Boolean | Public visibility |
| `organizerId` | Long | Organizer user ID |
| `tags` | String[] | Optional tags |

### Notification Object
| Field | Type | Notes |
|-------|------|-------|
| `id` | Long | Unique notification ID |
| `title` | String | Short title |
| `message` | String | Notification body |
| `type` | String | `registration`, `reminder`, etc. |
| `isRead` | Boolean | Read state |
| `createdAt` | ISO DateTime | When created |
| `eventId` | Long | Related event (optional) |

### Hackathon Object
| Field | Type | Notes |
|-------|------|-------|
| `id` | Long | Unique ID |
| `hackathonName` | String | Required, min 3 chars |
| `organizerName` | String | Required |
| `email` | String | Contact email |
| `startDate` | String | `YYYY-MM-DD`, future date |
| `endDate` | String | `YYYY-MM-DD`, after startDate |
| `description` | String | Min 20 chars |
| `location` | String | Online or city |
| `participantLimit` | Integer | Optional |
| `prizeDetails` | String | Optional |
| `website` | String | Optional, valid URL |

---

## Quick Reference — All Endpoints

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/api/auth/signup` | No | — |
| POST | `/api/auth/login` | No | — |
| POST | `/api/auth/google` | No | — |
| POST | `/api/auth/logout` | Yes | Any |
| POST | `/api/auth/reset-password` | No | — |
| GET | `/api/events` | No | — |
| GET | `/api/events/{id}` | No | — |
| POST | `/api/events/create` | Yes | ADMIN, ORGANIZER |
| PUT | `/api/events/{id}` | Yes | ADMIN, ORGANIZER |
| DELETE | `/api/events/{id}` | Yes | ADMIN, SUPER_ADMIN |
| GET | `/api/events/{id}/availability` | No | — |
| POST | `/api/events/{id}/register` | Yes | Any |
| GET | `/api/users/my-events` | Yes | Any |
| GET | `/api/hackathons` | No | — |
| GET | `/api/hackathons/{id}` | No | — |
| POST | `/api/hackathons` | Yes | ADMIN, ORGANIZER |
| PUT | `/api/hackathons/{id}` | Yes | ADMIN, ORGANIZER |
| DELETE | `/api/hackathons/{id}` | Yes | ADMIN, SUPER_ADMIN |
| POST | `/api/hackathons/{id}/register` | Yes | Any |
| GET | `/api/projects` | No | — |
| GET | `/api/projects/{id}` | No | — |
| POST | `/api/projects` | Yes | Any |
| GET | `/api/projects/categories` | No | — |
| POST | `/api/projects/{id}/upvote` | Yes | Any |
| GET | `/api/users/profile` | Yes | Any |
| PUT | `/api/users/profile` | Yes | Any |
| GET | `/api/users/achievements` | Yes | Any |
| GET | `/api/admin/users` | Yes | ADMIN, SUPER_ADMIN |
| PUT | `/api/admin/users/{id}` | Yes | SUPER_ADMIN |
| DELETE | `/api/admin/users/{id}` | Yes | SUPER_ADMIN |
| GET | `/api/admin/stats` | Yes | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/events` | Yes | ADMIN, SUPER_ADMIN |
| GET | `/api/admin/analytics` | Yes | ADMIN, ORGANIZER |
| GET | `/api/notifications` | Yes | Any |
| PUT | `/api/notifications/{id}/read` | Yes | Any |
| PUT | `/api/notifications/read-all` | Yes | Any |
| GET | `/api/leaderboard` | No | — |
| GET | `/api/leaderboard/me` | Yes | Any |
| POST | `/api/feedback` | Yes | Any |
| GET | `/api/feedback/event/{eventId}` | Yes | ADMIN, ORGANIZER |
| GET | `/api/events/stream` | Yes | Any |

---

> **Notes for the Backend Team:**
> 1. All date-times should be in **ISO 8601** format: `2026-08-15T10:00:00`
> 2. The frontend expects the JWT token under the `token` **or** `accessToken` key in the login/signup response body.
> 3. The `roles` field must be an **array** of strings (not a single string).
> 4. The `isRead` field on notifications must be a **boolean**, not `0`/`1`.
> 5. Please enable **Swagger UI** at `/swagger-ui/index.html` for all endpoints.
> 6. The frontend gracefully queues failed registration requests (offline queue) — the backend doesn't need to handle this, but should be idempotent for registration retries.
> 7. Swagger/OpenAPI documentation should include:

   * Response schemas
   * Error response documentation
   * Authentication requirements for protected endpoints
   * Parameter descriptions
   * Example response values where applicable



### Event Registration Constraint
- **Duplicate Prevention**: Implemented a check to prevent users from registering multiple times for the same event, throwing an HTTP 409 Conflict exception if a duplicate registration is attempted.
