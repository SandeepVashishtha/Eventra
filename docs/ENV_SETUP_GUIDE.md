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

Examples:

```env
VITE_API_URL=https://api.example.com
```

or:

```env
BACKEND_URL=https://api.example.com
```

## Security Notes

- Never place private secrets in `REACT_APP_*` variables.
- Values prefixed with `REACT_APP_` are exposed in the browser bundle.
- Leave `REACT_APP_SENTRY_DSN` blank for local development unless you intentionally want browser error reports sent to Sentry.
- Keep private credentials server-side only (for example `GITHUB_TOKEN`).

## Troubleshooting

- If startup fails with "Backend URL is not configured", set `BACKEND_URL`, `VITE_API_URL`, or `REACT_APP_API_URL`.
- If API calls or SSE streams fail, verify the configured backend URL points to a reachable backend.
- If shared links are wrong, check `REACT_APP_PUBLIC_URL`.
- If build-time checks fail, run:

```bash
npm run validate-env
```
