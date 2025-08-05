# Eventra Platform - Authentication & Authorization

## Overview
This feature implements a robust authentication and authorization system for the Eventra platform, enabling secure login, signup, and role-based access control (RBAC).

## Key Features
- **Secure Authentication:**
  - User signup and login with secure password handling (BCrypt hashing).
  - JWT-based authentication for stateless and secure API access.
- **Role-Based Access Control (RBAC):**
  - **Roles:** `ADMIN`, `EVENT_MANAGER`, `USER`
  - **Permissions:** Granular permissions for actions like `CREATE_EVENT`, `EDIT_USER`, `VIEW_ANALYTICS`, etc.
  - Roles are mapped to a set of permissions, allowing for flexible and scalable access control.
- **Dashboards:**
  - **Admin Dashboard:** Provides an overview of platform activity, including user and event management.
  - **User Dashboard:** A personalized space for users to manage their events and platform interactions.
- **Protected Routes:**
  - Both frontend and backend routes are protected based on user roles and permissions.

## Getting Started

### Prerequisites
- Java 21 & Maven
- Node.js & npm
- MySQL (or use the embedded H2 database for testing)

### Backend Setup
1. **Navigate to the `backend` directory.**
2. **Configure `application.properties`:**
   - Set up your database connection (MySQL or H2).
   - A default JWT secret is provided, but it's recommended to change it for production.
3. **Run the backend application:**
   ```
   mvn spring-boot:run
   ```
- The backend will be running on `http://localhost:8080`.
- A default admin user is created on startup:
  - **Email:** `admin@eventra.com`
  - **Password:** `admin123`

### Frontend Setup
1. **Navigate to the `frontend` directory.**
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Run the frontend application:**
   ```
   npm start
   ```
- The frontend will be running on `http://localhost:3000`.

## Usage
- **Sign up** as a new user or **log in** with the default admin credentials.
- Based on your role, you will be redirected to the appropriate dashboard.
- Explore the platform and test the role-based access control by attempting to access protected routes.

## Next Steps
- [ ] Implement password reset functionality.
- [ ] Add more comprehensive tests for both backend and frontend.
- [ ] Enhance UI/UX for all authentication and dashboard components.
- [ ] Implement session timeout and refresh token logic.


