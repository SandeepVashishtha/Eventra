# Eventra Environment Setup Guide

This guide explains the active frontend environment variables for Eventra.

## Quick Start

1. Copy the sample file:

```bash
cp .env.example .env
```

1. Set the required API URL:

```env
VITE_API_URL=http://localhost:8080
REACT_APP_API_URL=http://localhost:8080/api
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

### Frontend Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL used by client requests and SSE streams |
| `REACT_APP_API_URL` | Yes | Backend API base URL (legacy compatibility) |
| `REACT_APP_GITHUB_REPO` | No | Public repository identifier for metadata/links |
| `REACT_APP_PUBLIC_URL` | No | Canonical public URL used for sharing/SEO helpers |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public push-notification key |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN; only used in production builds |

### Server-Side Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | **Yes** | JWT signing secret for authentication. This is MANDATORY - the application will NOT start or handle requests without it. There is NO fallback secret. |

## Security Notes

- **JWT_SECRET is mandatory**: The application enforces fail-closed security. Missing JWT_SECRET will cause the application to reject all requests with a 500 error. Never deploy without setting this variable.
- Generate JWT_SECRET using: `openssl rand -base64 32`
- Never place private secrets in `REACT_APP_*` variables.
- Values prefixed with `REACT_APP_` are exposed in the browser bundle.
- Leave `REACT_APP_SENTRY_DSN` blank for local development unless you intentionally want browser error reports sent to Sentry.
- Keep private credentials server-side only (for example `GITHUB_TOKEN`).

## Troubleshooting

- If API calls or SSE streams fail, verify `VITE_API_URL` points to a reachable backend.
- If shared links are wrong, check `REACT_APP_PUBLIC_URL`.
- If the application returns 500 errors with "Server configuration error", verify `JWT_SECRET` is set.
- If build-time checks fail, run:

```bash
npm run validate-env
```
