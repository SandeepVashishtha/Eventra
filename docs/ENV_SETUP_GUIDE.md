# Eventra Environment Setup Guide

This guide explains the active frontend environment variables for Eventra.

## Quick Start

1. Copy the sample file:

```bash
cp .env.example .env
```

1. Set the required backend URL (choose one):

```env
# Option 1: Preferred for Vite builds
VITE_API_URL=http://localhost:8080

# Option 2: For dev proxy override
BACKEND_URL=http://localhost:8080

# Option 3: For CRA compatibility
REACT_APP_API_URL=http://localhost:8080
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

## Backend Configuration Architecture

All backend endpoint configuration is centralized in `src/config/backendConfig.js`. This module:

- Provides a single source of truth for backend URLs
- Resolves environment variables in a consistent priority order
- Normalizes URLs (removes trailing slashes, `/api` suffix)
- Validates configuration and provides clear error messages
- Exports `BACKEND_URL`, `API_BASE_URL`, and `SSE_BASE_URL` for consumers

### Environment Variable Resolution Order

The system checks environment variables in this order (highest to lowest priority):

1. `BACKEND_URL` - Used by dev proxy, can override other settings
2. `VITE_API_URL` - Preferred for Vite builds
3. `REACT_APP_API_URL` - For CRA compatibility

### Fallback Behavior

- **Development**: Falls back to `http://localhost:8080` if no variable is set
- **Production**: No automatic fallback - configuration must be explicitly set via environment variables to avoid configuration drift

### Configuration Consumers

The following modules all use the centralized configuration:

- `src/config/api.js` - API requests via axios
- `src/utils/sseMultiplexer.js` - Server-Sent Events streams
- `src/utils/certificateUtils.js` - Certificate verification

**Note**: `src/setupProxy.js` runs in a Node.js context and uses its own inline resolution logic to avoid ESM/CommonJS compatibility issues, but follows the same resolution order.

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
| `DATABASE_URL` | Yes (server-side, production) | Database connection URL for persistent authentication storage |
| `KV_REST_API_URL` | Yes (server-side, production) | Vercel KV/Redis REST API URL for distributed rate limiting |
| `KV_REST_API_TOKEN` | Yes (server-side, production) | Vercel KV/Redis REST API token for distributed rate limiting |
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

## Content Security Policy (CSP) Backend Origin Configuration

The Edge Middleware dynamically configures the Content-Security-Policy (CSP) `connect-src` directive using backend origins from environment variables. This allows flexible deployment across different environments without modifying source code.

**Configuration:**
- The middleware reads backend origins from `BACKEND_URL`, `VITE_API_URL`, and `REACT_APP_API_URL` (in that priority order)
- Each valid origin is validated and added to the CSP `connect-src` directive
- Only `http` and `https` protocols are allowed
- Invalid URLs are rejected with a warning logged to the console

**Security Considerations:**
- Origins are validated before being added to CSP
- Malformed URLs or unsupported protocols are safely rejected
- If no valid backend origin is configured, CSP will not include backend origins (API calls may be blocked, but the application will not crash)
- The application fails safely with a warning rather than crashing

**Examples:**

Development environment:
```env
BACKEND_URL=http://localhost:8080
VITE_API_URL=http://localhost:8080
REACT_APP_API_URL=http://localhost:8080/api
```

Production environment:
```env
BACKEND_URL=https://api.example.com
VITE_API_URL=https://api.example.com
REACT_APP_API_URL=https://api.example.com/api
```

Multiple backends (if needed):
```env
# All valid origins will be added to CSP
BACKEND_URL=https://api-primary.example.com
VITE_API_URL=https://api-secondary.example.com
REACT_APP_API_URL=https://api-tertiary.example.com
```

**Behavior:**
- The middleware checks environment variables in priority order: `BACKEND_URL` → `VITE_API_URL` → `REACT_APP_API_URL`
- Duplicate origins are automatically deduplicated
- If no valid backend origin is configured, a warning is logged but the application continues to run
- The CSP will still include other trusted sources like `https://api.github.com`
- Changes to environment variables require a redeployment of the Edge Middleware

### Server-Side Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | JWT signing secret for authentication. This is MANDATORY - the application will NOT start or handle requests without it. There is NO fallback secret. |
| `DATABASE_URL` | **Yes (production)** | Database connection URL for persistent authentication storage. Required in production to prevent data loss on serverless cold starts. |
| `KV_REST_API_URL` | **Yes (production)** | Vercel KV/Redis REST API URL for distributed rate limiting. Required in production to prevent rate-limit bypass across multiple instances. |
| `KV_REST_API_TOKEN` | **Yes (production)** | Vercel KV/Redis REST API token for distributed rate limiting. Required in production to prevent rate-limit bypass across multiple instances. |

## Distributed Rate Limiting

Eventra uses distributed rate limiting to prevent brute-force attacks and credential stuffing across multiple serverless instances. The rate limiter uses Redis/Vercel KV for shared state, ensuring that attackers cannot bypass throttling by distributing requests across different instances.

### Architecture

- **Storage Layer**: `api/lib/rate-limit-storage.js` provides a unified interface for rate-limit storage
- **Configuration**: `api/lib/rate-limit-config.js` enforces fail-closed security for distributed storage
- **Rate Limiter**: `api/lib/rateLimiter.js` implements distributed rate limiting with atomic operations
- **Fail-Closed**: In production, if distributed storage is unavailable, rate limiting rejects requests rather than allowing unlimited access

### Environment Variables

For production deployments, configure the following environment variables:

```env
# Vercel KV or Redis configuration
KV_REST_API_URL=https://your-kv-store.redis.com
KV_REST_API_TOKEN=your-secure-token
```

### Provisioning Vercel KV

If deploying to Vercel, provision a KV store:

```bash
vercel kv create eventra-rate-limit
```

Then add the environment variables to your Vercel project:

```bash
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

### Local Development

In development and test environments, the rate limiter automatically falls back to in-memory storage. No additional configuration is required for local development.

### Rate Limits

Current rate limits:

- **Login**: 10 requests per minute per IP address
- **Signup**: 5 requests per minute per IP address

### Security Behavior

- **Production**: Requires distributed storage. If unavailable, authentication requests are rejected with a 429 error.
- **Development/Test**: Uses in-memory storage for convenience. Distributed storage is optional.
- **Fail-Closed**: Never silently allows unlimited requests in production.
| `DATABASE_URL` | **Yes (production)** | Redis connection string for persistent authentication storage. Required in production to prevent user account loss on restart. |
| `KV_REST_API_URL` | **Yes (production)** | Alternative to DATABASE_URL for Vercel KV Redis storage. Required in production if DATABASE_URL is not set. |
| `KV_REST_API_TOKEN` | **Yes (production with KV)** | Authentication token for Vercel KV REST API. Required when using KV_REST_API_URL. |

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
- **DATABASE_URL or KV_REST_API_URL is mandatory in production**: The application enforces fail-closed security for authentication storage. Without persistent storage, all user accounts are lost on server restart. Never deploy production without setting one of these variables.
- Generate JWT_SECRET using: `openssl rand -base64 32`
- Never place private secrets in `REACT_APP_*` or `VITE_*` variables.
- Values prefixed with `REACT_APP_` or `VITE_` are exposed in the browser bundle.
- Leave `REACT_APP_SENTRY_DSN` blank for local development unless you intentionally want browser error reports sent to Sentry.
- Keep private credentials server-side only (for example `GITHUB_TOKEN`).

## Troubleshooting

- If API calls or SSE streams fail, verify your backend URL variable points to a reachable backend.
- Check the browser console for configuration validation errors from `src/config/backendConfig.js`.
- If shared links are wrong, check `REACT_APP_PUBLIC_URL`.
- If the application returns 500 errors with "Server configuration error", verify `JWT_SECRET` is set.
- If build-time checks fail, run:

```bash
npm run validate-env
```

## Configuration Examples

### Local Development with Local Backend

```env
BACKEND_URL=http://localhost:8080
# or
VITE_API_URL=http://localhost:8080
# or
REACT_APP_API_URL=http://localhost:8080
```

### Local Development with Deployed Backend

```env
BACKEND_URL=https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
# or
VITE_API_URL=https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
# or
REACT_APP_API_URL=https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
```

### Production Deployment

In production (Vercel), the backend URL is handled via:

1. `vercel.json` rewrites that proxy `/api/*` to the deployed backend
2. `REACT_APP_API_URL="/api"` in the Vercel environment

**Important**: The centralized configuration does NOT automatically fall back to a hardcoded backend URL in production. This prevents configuration drift. For production deployments, ensure your environment variables are properly set in your deployment platform.
