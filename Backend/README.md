# Eventra Backend

## Overview

Eventra Backend is the core RESTful API service for the Eventra platform, built with Spring Boot. It powers features such as user authentication, event management, project showcases, hackathon registrations, and real-time analytics. This service is designed to be secure, scalable, and developer-friendly, providing the foundational infrastructure for the Eventra ecosystem.

## What this backend provides

The backend implements a comprehensive set of modules to handle various platform requirements:

*   **Authentication & Security**: JWT-based authentication with support for standard login/signup and Google OAuth. Includes a token blacklist for secure logout and IP-based rate limiting.
*   **User Management**: APIs for user profiles and tracking registered events.
*   **Event Management**: Full CRUD for events, including real-time availability tracking and Server-Sent Events (SSE) for live updates.
*   **Hackathons**: Registration and management systems specifically for hackathon events.
*   **Project Showcase**: Endpoints for listing, detailed viewing, and upvoting community projects.
*   **Feedback System**: Integrated feedback submission for attendees to rate and review events.
*   **Real-time Analytics**: Dashboard and trend analysis for registrations, feedback, and organizer performance.

## Tech Stack

| Area | Technology |
| :--- | :--- |
| **Language** | Java 17 |
| **Framework** | Spring Boot 3.4.4 |
| **Security** | Spring Security, JWT (jjwt), Bucket4j (Rate Limiting) |
| **Database** | PostgreSQL (Production), H2 (Development/Testing) |
| **ORM** | Spring Data JPA / Hibernate |
| **Build Tool** | Maven |
| **Testing** | JUnit 5, MockMvc |
| **API Docs** | Swagger / OpenAPI 3 (SpringDoc) |

## API Modules Overview

| Module | Key Endpoints | Capabilities |
| :--- | :--- | :--- |
| **Auth** | `/api/auth/*` | Signup, Login, Google OAuth, Logout (Blacklisting) |
| **Users** | `/api/users/*` | Profile retrieval/update, My registered events |
| **Events** | `/api/events/*` | CRUD, Registration, Availability, SSE Stream |
| **Projects** | `/api/projects/*` | List, Detail, Create, Categories, Upvoting |
| **Hackathons**| `/api/hackathons/*` | List, Detail, Create, Update, Register |
| **Feedback** | `/api/feedback` | Submit event feedback and ratings |
| **Analytics** | `/api/analytics/*` | Dashboard stats, Registration trends, Organizer insights |

## Getting Started

### Prerequisites

*   Java 17 JDK
*   Maven 3.8+
*   An IDE (IntelliJ IDEA, VS Code, etc.)

### Local Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/SandeepVashishtha/Eventra-Backend.git
    cd Eventra-Backend
    ```

2.  **Set Environment Variables**:
    You must set a `JWT_SECRET` for the application to start.

    **Windows (PowerShell)**:
    ```powershell
    $env:JWT_SECRET="your-development-secret-key-at-least-64-characters-long-for-security"
    ```

    **Unix / macOS**:
    ```bash
    export JWT_SECRET="your-development-secret-key-at-least-64-characters-long-for-security"
    ```

3.  **Run the application**:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(Use `.\mvnw` on Windows)*

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `JWT_SECRET` | **Yes** | Secret key for signing JWT tokens (min 64 chars recommended) |
| `JWT_EXPIRATION_MS`| No | Token validity duration in ms (Default: 86400000 - 24h) |
| `CORS_ALLOWED_ORIGINS`| No | Comma-separated list of allowed origins |
| `RATE_LIMIT_ENABLED`| No | Toggle for API rate limiting (Default: true) |
| `GOOGLE_CLIENT_ID` | No | Client ID for Google OAuth integration |

## Database Configuration

*   **Development**: By default, the application uses an in-memory **H2 Database** (`jdbc:h2:mem:testdb`) for easy local development without external dependencies.
*   **Production**: The project is configured to support **PostgreSQL**. Database connection details should be provided via environment variables in a production environment.
*   **JPA Strategy**: Hibernate is set to `update` mode in development, automatically managing schema changes based on entities.

## Running Tests

To execute the full test suite:

**Windows**:
```powershell
.\mvnw test
```

**Unix / macOS**:
```bash
./mvnw test
```

To run a specific test class:
```bash
./mvnw test -Dtest=FeedbackControllerTests
```

## Swagger / API Documentation

The interactive Swagger UI allows you to explore and test the API endpoints:

*   **Production**: [https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html](https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html)
*   **Local Development**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

The raw OpenAPI specification is available at `http://localhost:8080/v3/api-docs`.

## Project Structure

```text
src/
  main/
    java/com/sandeep/eventrabackend/
      config/        # Security, CORS, JWT, Swagger, and Rate Limit configurations
      controller/    # REST API controllers (Entry points)
      dto/           # Data Transfer Objects (Request/Response)
      exception/     # Custom exceptions and Global Exception Handler
      model/         # JPA Entities (Database schema)
      repository/    # Spring Data JPA Repositories
      service/       # Business logic implementation
      security/      # JWT filters, providers, and authentication logic
      ratelimit/     # Rate limiting service and logic
    resources/
      application.yml # Application configuration and properties
  test/              # Comprehensive Unit and Integration tests
```

## Security Overview

*   **Stateless Authentication**: Uses JWT (JSON Web Tokens) to maintain user state without server-side sessions.
*   **Role-Based Access Control (RBAC)**: Specific endpoints are protected based on user roles (`USER`, `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`).
*   **Rate Limiting**: Protects sensitive endpoints (Login, Signup) from brute-force attacks using the Token Bucket algorithm (Bucket4j).
*   **Token Blacklisting**: Ensures that logged-out users cannot reuse their tokens before expiration.
*   **Password Hashing**: Uses `BCryptPasswordEncoder` for secure storage of user credentials.

## Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  **Fork the repository** and create a feature branch.
2.  **Keep PRs focused**: One feature or bug fix per Pull Request.
3.  **Code Quality**: Follow standard Java and Spring Boot conventions.
4.  **Tests**: Ensure all existing tests pass and add new tests for your changes.
5.  **Documentation**: Update API documentation if you modify any endpoints.

## Related Repositories

*   **Frontend (Eventra)**: [https://github.com/SandeepVashishtha/Eventra](https://github.com/SandeepVashishtha/Eventra)

---
*Built with ❤️ by the Eventra Team.*
