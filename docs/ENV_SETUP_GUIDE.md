# Eventra Environment Setup Guide

This guide explains the active frontend environment variables for Eventra.

## Quick Start

1. Copy the sample file:

```bash
cp .env.example .env
```

1. Set an explicit backend URL:

```env
VITE_API_URL=http://localhost:8080
```

1. Set the required JWT secret:

```env
JWT_SECRET=<your-generated-secret>
```

Generate a secure JWT secret using:

```bash
openssl rand -base64 32
```

1. Start the app:

```bash
npm run dev
```

## Active Variables

Set at least one backend URL before starting the app. `VITE_API_URL` is preferred for Vite builds, `BACKEND_URL` configures the dev proxy backend origin directly, and `REACT_APP_API_URL` remains supported for compatibility.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | One of backend URLs | Backend API base URL used by Vite client builds and the dev proxy |
| `BACKEND_URL` | One of backend URLs | Backend origin used by the Vite dev proxy |
| `REACT_APP_API_URL` | One of backend URLs | Compatibility API base URL used by client requests and the dev proxy |
| `REACT_APP_GITHUB_REPO` | No | Public repository identifier for metadata/links |
| `REACT_APP_PUBLIC_URL` | No | Canonical public URL used for sharing/SEO helpers |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public push-notification key |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN; only used in production builds |
| `JWT_SECRET` | Yes (server-side) | JWT signing secret for Edge Middleware auth verification |
| `BLOCKED_COUNTRIES` | No (server-side) | Comma-separated ISO 3166-1 alpha-2 country codes to block |
| `ALLOWED_ORIGINS` | No (server-side) | Comma-separated list of allowed CORS origins for API access |

## Geographic Access Restrictions

The Edge Middleware supports configurable country-based access restrictions via the `BLOCKED_COUNTRIES` environment variable. This is a server-side configuration that affects all incoming requests.

**Configuration:**
- Set `BLOCKED_COUNTRIES` to a comma-separated list of two-letter ISO 3166-1 alpha-2 country codes
- Leave empty to allow access from all countries (default behavior)
- Country codes are case-insensitive and whitespace is trimmed automatically

**Examples:**
```env
# Block specific countries
BLOCKED_COUNTRIES=CU,IR,KP,SY,RU

# Allow all countries (default)
BLOCKED_COUNTRIES=
```

**Behavior:**
- Requests from blocked countries receive HTTP 451 (Unavailable For Legal Reasons)
- Blocked requests are logged with the country code for monitoring
- Self-hosted deployments can configure this based on their requirements
- No restrictions are applied when the variable is empty or unset

## CORS Configuration

The API enforces a strict allowlist-based CORS policy via the `ALLOWED_ORIGINS` environment variable. This controls which domains can make cross-origin requests to Eventra APIs.

**Configuration:**
- Set `ALLOWED_ORIGINS` to a comma-separated list of trusted origin URLs
- Include the full URL with protocol (http/https) and port if non-standard
- Origins are case-sensitive and must match exactly
- Whitespace around origins is trimmed automatically
- Leave empty to block all cross-origin requests (fail closed)

**Examples:**
```env
# Production deployment
ALLOWED_ORIGINS=https://eventra.com,https://www.eventra.com,https://api.eventra.com

# Development with localhost (localhost is auto-allowed in non-production)
ALLOWED_ORIGINS=

# Block all cross-origin requests
ALLOWED_ORIGINS=
```

**Development Support:**
In non-production environments (`NODE_ENV !== "production"`), common localhost origins are automatically allowed:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

These development origins are **blocked** in production unless explicitly added to `ALLOWED_ORIGINS`.

**Security Notes:**
- Never use wildcard (`*`) in production
- Only explicitly listed origins receive CORS access
- Untrusted origins receive no CORS headers (browser blocks the request)
- This prevents unauthorized cross-origin access and information disclosure
- See `docs/SECURITY_ARCHITECTURE.md` for detailed security rationale

### Server-Side Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | JWT signing secret for authentication. This is MANDATORY - the application will NOT start or handle requests without it. There is NO fallback secret. |

Examples:

```env
VITE_API_URL=https://api.example.com
```

or:

```env
BACKEND_URL=https://api.example.com
```

## Security Notes

- **JWT_SECRET is mandatory**: The application enforces fail-closed security. Missing JWT_SECRET will cause the application to reject all requests with a 500 error. Never deploy without setting this variable.
- Generate JWT_SECRET using: `openssl rand -base64 32`
- Never place private secrets in `REACT_APP_*` variables.
- Values prefixed with `REACT_APP_` are exposed in the browser bundle.
- Leave `REACT_APP_SENTRY_DSN` blank for local development unless you intentionally want browser error reports sent to Sentry.
- Keep private credentials server-side only (for example `GITHUB_TOKEN`).

## Troubleshooting

- If startup fails with "Backend URL is not configured", set `BACKEND_URL`, `VITE_API_URL`, or `REACT_APP_API_URL`.
- If API calls or SSE streams fail, verify the configured backend URL points to a reachable backend.
- If shared links are wrong, check `REACT_APP_PUBLIC_URL`.
- If the application returns 500 errors with "Server configuration error", verify `JWT_SECRET` is set.
- If build-time checks fail, run:

```bash
npm run validate-env
```
