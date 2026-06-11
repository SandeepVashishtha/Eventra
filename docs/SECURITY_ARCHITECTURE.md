# Eventra Security Architecture

This document describes the security architecture of Eventra, detailing the design, patterns, and protocols enforced to protect the application and its users.

---

## 1. Authentication Flow

Eventra enforces cookie-based authentication using JSON Web Tokens (JWT) stored in secure, `HttpOnly` cookies. The client never handles the raw token directly in Javascript, mitigating Cross-Site Scripting (XSS) token exfiltration risks.

### 1.1 Fail-Closed Security

**CRITICAL**: Eventra enforces fail-closed security for JWT authentication. The `JWT_SECRET` environment variable is mandatory with NO fallback secret.

- If `JWT_SECRET` is missing, empty, or whitespace-only:
  - Build-time validation fails with a critical security error
  - Runtime token signing throws an error
  - Edge middleware returns HTTP 500 for protected routes
  - RBAC is NEVER bypassed

This prevents unauthorized access when configuration is incomplete.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Client Browser
    participant API as Serverless API Endpoint
    participant Store as User Store (Memory/DB)

    Client->>API: POST /api/auth/signup or /login (Credentials)
    API->>Store: Lookup User / Compare Password (BCrypt)
    Store-->>API: User Verified
    API->>API: Sign JWT with JWT_SECRET (Mandatory)
    API-->>Client: 200/201 JSON (Set-Cookie: token=JWT; HttpOnly; SameSite=Strict; Secure)
    
    Note over Client, API: Subsequent requests carry the cookie automatically
    
    Client->>API: GET /api/protected-route (Carries Token Cookie)
    API->>API: verifyAuth Middleware checks signature and expiry
    API->>Store: Confirm user is active and exists
    API-->>Client: 200 JSON (Protected Resource)
    
    Client->>API: POST /api/auth/logout
    API-->>Client: Set-Cookie: token=; Max-Age=0 (Clears Cookie)
```

---

## 2. Token Lifecycle & Session Management

- **Short Access Token Expiration**: The JWT default lifetime (`JWT_EXPIRES_IN`) is set to `1h` (1 hour). This limits the exposure window of any intercepted session token.
- **Dynamic Cookie Attributes**:
  - `HttpOnly`: Access blocked to `document.cookie` from script space.
  - `SameSite=Strict`: Prevents the cookie from being sent on cross-site requests, mitigating Cross-Site Request Forgery (CSRF).
  - `Secure`: Cookie only transmitted over HTTPS connections (enforced in production).
  - `Max-Age`: Computed dynamically based on `JWT_EXPIRES_IN` to ensure cookie and JWT lifetimes match.
- **Revocation and User Existence Checks**:
  - The `verifyAuth` middleware does not rely solely on cryptographic validation of the token payload.
  - On every authenticated request, the middleware looks up the user in the store (`usersById` or `users`) and checks that `user.isActive !== false` before authorizing the request. This ensures suspended or deleted accounts lose access immediately.

---

## 3. Rate Limiting Strategy

Eventra protects resource-intensive API paths (like authentication and LLM recommendation probes) using a dual-layer, sliding-window rate limiter keyed by client IP.

- **Sliding-Window Limiter**: Eliminates the boundary-burst vulnerability inherent to fixed-window systems by tracking exact request timestamps per IP and checking counts dynamically.
- **Periodic sweeps**: The in-memory cache prunes stale IP buckets to ensure memory consumption remains bounded under long-running processes.
- **Configurations**:
  - **Login Route**: Limited to 5 requests per minute per IP.
  - **Signup Route**: Limited to 3 requests per minute per IP.
  - **General APIs**: Throttled using Edge Middleware / Vercel KV REST API at the routing boundary.

---

## 4. Content Security Policy (CSP)

Global security headers are defined in `vercel.json` to prevent injection attacks and MIME-sniffing:

- `Content-Security-Policy`: Disallows unauthorized scripts, styles, or frames.
  - `default-src 'self'`: Default fallback to trusted local origin.
  - `script-src 'self' https://accounts.google.com https://cdn.jsdelivr.net`: Restricts executable scripts.
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`: Restricts styling vectors.
  - `object-src 'none'`: Blocks Flash and Java applets.
  - `frame-ancestors 'none'`: Prevents clickjacking by blocking rendering in `<iframe>`, `<frame>`, or `<embed>`.
- `X-Frame-Options: DENY`: Global frame prevention.
- `X-Content-Type-Options: nosniff`: Enforces correct MIME types to prevent script execution via non-JS file uploads.
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer leakage.

---

## 5. Input Sanitization Guidelines

Always choose the appropriate helper for the context of user input:

| Helper Function | Target Use Case | Actions Taken |
| :--- | :--- | :--- |
| `sanitizeHtml` | Rich Text / Descriptions (for rendering via `dangerouslySetInnerHTML`) | Cleans HTML tags against a whitelist; blocks `javascript:`/`data:` protocols; strips event handlers (`onerror`, `onload`). |
| `sanitizeInputText` | Plain text inputs (form fields) | Escapes special characters (`<`, `>`, `&`, `"`, `'`) to safe HTML entities. |
| `sanitizeSearchQuery` | Search queries / API parameters | Strips all HTML, tags, query operators, and truncates queries to 200 characters to prevent ReDoS / NoSQL injection. |

---

## 6. CSRF Protection

For state-changing actions (POST, PUT, PATCH, DELETE), the frontend attaches a unique, session-bound token:

1. The CSRF token is obtained via `getCSRFToken()`, which checks the meta tag first, then cookies.
2. Frontend requests append the token to the `X-CSRF-Token` header.
3. The server validates this token against the request session, rejecting mismatched requests with `403 Forbidden`.

### Token Sources

The CSRF token can be provided through two sources (checked in order):

1. **Meta Tag**: `<meta name="csrf-token" content="TOKEN_VALUE">` in `index.html`
2. **Cookie**: `XSRF-TOKEN` cookie (or custom name via `getCSRFTokenFromCookie(name)`)

### Enforcement Modes

CSRF protection behavior is configurable via the `VITE_CSRF_ENFORCEMENT_MODE` environment variable:

- **warning** (default): Logs missing CSRF tokens to console (structured JSON in production) but allows requests to proceed. Suitable for gradual rollout or development.
- **strict**: Blocks requests when CSRF token is missing by throwing a `CSRFError`. Recommended for production environments with complete CSRF token setup.
- **disabled**: Disables CSRF protection entirely. Not recommended except for specific legacy scenarios.

### Configuration

Set the enforcement mode in `.env` or `.env.local`:

```bash
VITE_CSRF_ENFORCEMENT_MODE=strict
```

### Production Visibility

Missing CSRF tokens are logged using structured logging in production:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "event": "csrf_token_missing",
  "method": "POST",
  "url": "/api/events",
  "enforcementMode": "warning"
}
```

This allows monitoring and alerting on CSRF token issues without exposing sensitive token values.

### API Integration

The request interceptor in `src/config/api/interceptors.js` automatically:

- Checks if the request method requires CSRF protection
- Validates token presence based on enforcement mode
- Attaches the token to the `X-CSRF-Token` header when present
- Throws `CSRFError` in strict mode when token is missing
- Logs security events for monitoring

### Error Handling

When a request is blocked due to missing CSRF token (strict mode), a `CSRFError` is thrown with:

- Message: "CSRF token required for {METHOD} request. Please ensure the CSRF token is available in the meta tag or cookie."
- Status: 403
- Integrates with the existing API error handling system

---

## 7. Security Policy and Reporting

For vulnerabilities, do not open public GitHub issues. Please refer to our responsible disclosure policy outlined in [SECURITY.md](../SECURITY.md) or email the maintenance team directly.

---

## 8. Persistent Authentication Storage Requirements

**CRITICAL**: Eventra enforces fail-closed security for authentication storage. In-memory user storage is permitted ONLY in development environments.

### 8.1 Production Storage Requirements

- **DATABASE_URL is mandatory in production**: The application will fail to start if `DATABASE_URL` is missing, empty, or whitespace-only when `NODE_ENV=production`.
- **No fallback to in-memory storage**: Production never falls back to Map-based storage. This prevents silent account loss after server restarts or serverless cold starts.
- **Fail-fast initialization**: The authentication modules validate storage configuration during module initialization, rejecting startup before accepting any requests.
- **Runtime protection**: Authentication endpoints return HTTP 500 with a generic "Authentication service unavailable" error if persistent storage is not configured.

### 8.2 Development Storage

- In-memory Map storage is allowed when `NODE_ENV` is not `production` (development, test, etc.).
- This preserves existing development and test workflows without requiring database setup.
- Development warnings are logged but do not prevent startup.

### 8.3 Security Rationale

- **Prevents account loss**: Without persistent storage, all user accounts vanish on server restart, causing 401 authentication failures for previously valid credentials.
- **Serverless compatibility**: Serverless platforms (Vercel, AWS Lambda) have cold starts that reset in-memory state. Persistent storage is required for production deployments.
- **Fail-closed design**: The application refuses to operate in an unsafe configuration rather than silently accepting data that will be lost.

### 8.4 Configuration

Set `DATABASE_URL` in your production environment:

```bash
# Required in production
DATABASE_URL=postgresql://user:password@host:5432/database
```

The validation script (`scripts/validate-env.js`) enforces this requirement during build time in production.

---

## 9. Developer Security Checklist

Before submitting a Pull Request, ensure:

- [ ] Unescaped user text is never directly written to `dangerouslySetInnerHTML`. Use `sanitizeHtml` or `sanitizeMarkdown`.
- [ ] No raw tokens or user credentials are printed in logs.
- [ ] Sensitive files or credentials are not checked into git.
- [ ] All local imports under `src/` specify correct `.js` extensions.
- [ ] State-changing endpoints are validated for both authentication and CSRF.
- [ ] Authentication storage validation is tested for both production and development modes.
