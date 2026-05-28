# Security Guide: Environment Variables

This document explains which environment variables are safe for frontend use,
which must remain server-side only, and the automated guard that prevents
accidental token exposure.

---

## The REACT_APP_ Bundle-Exposure Risk

Create React App (CRA) statically embeds every variable prefixed with
`REACT_APP_` into the compiled JavaScript bundle at build time. This happens
**unconditionally** — even if the variable is never referenced in application
code. The embedded value is then shipped to every visitor's browser in
`build/static/js/main.*.js` and is trivially readable with:

```bash
grep -r "GITHUB_TOKEN" build/static/js/
```

or by opening DevTools → Sources → any main bundle file.

## Forbidden Prefixes for Secrets

The following variable names must **never** use the `REACT_APP_` prefix:

| Variable | Why it must be server-side |
|---|---|
| `GITHUB_TOKEN` | A leaked PAT allows repo read/write, org enumeration, and API exhaustion |
| `EMAILJS_*_KEY` | Allows sending unlimited emails under your account |
| `SENTRY_DSN` | Low risk, but still leaks your project identifier |
| Any `*_SECRET` | Self-explanatory |
| Any `*_PRIVATE_KEY` | Self-explanatory |
| Any database credentials | Must never be frontend-accessible |

## Safe Frontend Variables

The following variables are safe to expose via `REACT_APP_` because they are
intended to be public:

| Variable | Safe because |
|---|---|
| `REACT_APP_API_URL` | Just a URL — no authentication |
| `REACT_APP_GOOGLE_CLIENT_ID` | Designed for public frontend use |
| `REACT_APP_FACEBOOK_APP_ID` | Designed for public frontend use |
| `REACT_APP_USE_REAL_API` | Feature flag — no secret data |

## Automated Build Guard

`scripts/check-env-safety.sh` is wired into `npm run prebuild` and will **fail
the build** if `.env.example` contains any `REACT_APP_` variable whose name
includes `TOKEN`, `SECRET`, `KEY`, `PASSWORD`, `CREDENTIAL`, or `PRIVATE`.

To run the check manually:

```bash
bash scripts/check-env-safety.sh
```

To check a specific env file:

```bash
bash scripts/check-env-safety.sh .env.production
```

## GitHub Token: Correct Setup

### Backend (correct)

Set `GITHUB_TOKEN` as a **server-side** environment variable:

- **Vercel**: Dashboard → Project → Settings → Environment Variables →
  set `GITHUB_TOKEN` with **Scope: Server** (not Preview or Production Client).
- **Docker / self-hosted**: Pass as an environment variable to the container,
  never bake it into the image.

The backend GitHub proxy at `/api/github-proxy` reads `GITHUB_TOKEN` from
`process.env` on the server and injects it into outgoing GitHub API requests.
The token never leaves the server.

### Frontend (correct)

The frontend calls the backend proxy:

```js
const url = `/api/github-proxy?path=${encodeURIComponent('/repos/owner/repo')}`;
const response = await fetch(url);
```

The frontend does **not** hold or send the token. The proxy returns sanitized
data only.

### What happens if REACT_APP_GITHUB_TOKEN is set with a real value?

1. CRA embeds the token string into `build/static/js/main.<hash>.js`.
2. Every visitor's browser downloads the bundle and the token.
3. An attacker runs `grep GITHUB_TOKEN build/static/js/*.js` and extracts it.
4. GitHub does **not** automatically detect tokens in deployed bundles (only
   in public git commits), so the token remains valid until manually rotated.
5. With `repo` scope: the attacker can read private repos, push code, create
   issues, and delete branches.
6. With `admin:org` scope: the attacker can enumerate and manage organization
   members.

## Security Checklist for Contributors

Before adding a new environment variable, ask:

- [ ] Does this variable contain a secret (API key, token, password)?
  - **Yes** → Use a plain name without `REACT_APP_` prefix. Configure it
    server-side only. Expose data to the frontend via a backend endpoint.
  - **No** → The `REACT_APP_` prefix is safe.
- [ ] Have you verified `npm run prebuild` passes after adding the variable to
  `.env.example`?
- [ ] Have you documented the variable in this file?
