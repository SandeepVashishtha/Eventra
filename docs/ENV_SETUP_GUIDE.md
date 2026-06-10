# Eventra Environment Setup Guide

This guide explains the active frontend environment variables for Eventra.

## Quick Start

1. Copy the sample file:

```bash
cp .env.example .env
```

1. Set the required API URL:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

1. Start the app:

```bash
npm run dev
```

## Active Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | Yes | Backend API base URL used by client requests and SSE streams |
| `REACT_APP_GITHUB_REPO` | No | Public repository identifier for metadata/links |
| `REACT_APP_PUBLIC_URL` | No | Canonical public URL used for sharing/SEO helpers |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public push-notification key |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN; only used in production builds |
| `JWT_SECRET` | Yes (server-side) | JWT signing secret for Edge Middleware auth verification |
| `BLOCKED_COUNTRIES` | No (server-side) | Comma-separated ISO 3166-1 alpha-2 country codes to block |

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

## Security Notes

- Never place private secrets in `REACT_APP_*` variables.
- Values prefixed with `REACT_APP_` are exposed in the browser bundle.
- Leave `REACT_APP_SENTRY_DSN` blank for local development unless you intentionally want browser error reports sent to Sentry.
- Keep private credentials server-side only (for example `GITHUB_TOKEN`).

## Troubleshooting

- If API calls or SSE streams fail, verify `REACT_APP_API_URL` points to a reachable backend.
- If shared links are wrong, check `REACT_APP_PUBLIC_URL`.
- If build-time checks fail, run:

```bash
npm run validate-env
```
