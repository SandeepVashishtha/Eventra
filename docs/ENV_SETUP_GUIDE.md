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

### Frontend Variables

| Variable | Required | Purpose | Priority |
| --- | --- | --- | --- |
| `BACKEND_URL` | No | Backend origin (overrides others) | 1 (highest) |
| `VITE_API_URL` | No | Backend API base URL (Vite - preferred) | 2 |
| `REACT_APP_API_URL` | No | Backend API base URL (CRA compatibility) | 3 |
| `REACT_APP_GITHUB_REPO` | No | Public repository identifier for metadata/links | - |
| `REACT_APP_PUBLIC_URL` | No | Canonical public URL used for sharing/SEO helpers | - |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public push-notification key | - |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint | - |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN; only used in production builds | - |

### Server-Side Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | JWT signing secret for authentication. This is MANDATORY - the application will NOT start or handle requests without it. There is NO fallback secret. |

## Security Notes

- **JWT_SECRET is mandatory**: The application enforces fail-closed security. Missing JWT_SECRET will cause the application to reject all requests with a 500 error. Never deploy without setting this variable.
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
