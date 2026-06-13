# Eventra

Modern event and hackathon platform for communities, organizers, and contributors.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)

---

## Project Status Notice

🚧 Eventra is actively maintained and welcomes contributions from the open-source community. Please check existing issues before creating new ones and follow the contribution guidelines when submitting pull requests.

## Table of Contents

- [Project Status Notice](#project-status-notice)
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Development](#docker-development)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing and Quality](#testing-and-quality)
- [SSE Mock Server (Optional)](#sse-mock-server-optional)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contributors](#contributors)
- [Maintainers](#maintainers)
- [Mentor](#mentor)
- [Star History](#star-history)

---

## Overview

Eventra is an open-source frontend application built with React and Vite. It supports event discovery, registration, dashboards, hackathons, collaboration features, feedback flows, and role-based access experiences.

This repository contains the frontend application. The Spring Boot backend is maintained in a separate repository — all API traffic is proxied to it both in production (via Vercel rewrites) and in local development (via Vite proxy).

- Frontend repo: [SandeepVashishtha/Eventra](https://github.com/SandeepVashishtha/Eventra)
- Backend repo: [SandeepVashishtha/Eventra-Backend](https://github.com/SandeepVashishtha/Eventra-Backend)
- Backend API base: Hosted on Azure App Services (Deployment currently offline)
- Swagger Documentation: Available via localhost when running the Spring Boot repository backend locally.

## Key Features

- Event and hackathon discovery, filtering, and registration flows
- Auth-aware routes with protected pages and role-aware behavior
- Dashboard and profile surfaces for users and organizers
- Real-time and offline-friendly UX utilities
- Feedback, recommendation, and community engagement modules
- Extensive utility and behavior test coverage

## Tech Stack

- React 18.2
- React Router 7
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Playwright (E2E)
- ESLint and Prettier

## Project Architecture

Below is the high-level architecture of Eventra:

```mermaid
graph TD
    Client[Client: React/Vite] --> Assets[Assets: public/]
    Client --> State[State: Context/Hooks]
    Client --> Backend[Backend: Spring Boot API]
    Backend --> Azure[Azure Spring Boot]
    Client -.-> VercelRewrite[Vercel /api/* Rewrite]
    VercelRewrite --> Backend
```

## Project Structure

```text
Eventra/
|-- docs/                # Architecture, env setup, onboarding, security docs
|-- public/              # Static assets
|-- scripts/             # Validation and automation scripts
|-- src/
|   |-- Pages/           # Route-level pages
|   |-- components/      # Shared and feature components
|   |-- context/         # React context providers
|   |-- hooks/           # Custom hooks
|   |-- utils/           # Utility modules
|   |-- config/          # Runtime/env config helpers
|   |-- App.jsx
|   `-- index.jsx
|-- tests/               # Node-based unit/integration tests
|-- vite.config.js
|-- vercel.json
`-- README.md
```

## Prerequisites

- Node.js `>=22.x`
- npm `>=9.6.4`

## Local Development

1. Clone and install:

```bash
git clone https://github.com/SandeepVashishtha/Eventra.git
cd Eventra
npm install
```

1. Create your env file:

```bash
cp .env.example .env
```
> **Tip:** If your operating system does not support `cp`, copy the file manually or use `copy .env.example .env` on Windows.

1. Start dev server:

npm run dev

App runs at `http://localhost:3000` (configured in `vite.config.js`).

## Docker Development

You can run Eventra fully containerized using Docker Compose to ensure a consistent environment:

1. Clone the repository and setup your environment variables:

```bash
git clone https://github.com/SandeepVashishtha/Eventra.git
cd Eventra
cp .env.example .env
```

1. Start the local development container:

```bash
docker compose up eventra-dev
```

The app will be available at `http://localhost:3000` with hot-reloading enabled.

1. Build and test the production container locally:

```bash
docker compose up --build eventra-prod
```

The production-optimized build will be served via Nginx at `http://localhost:8080`.

## Environment Variables

Use `.env.example` as the source of truth. See [docs/ENV_SETUP_GUIDE.md](docs/ENV_SETUP_GUIDE.md) for detailed configuration information.

| Variable | Required | Purpose |
| --- | --- | --- |
| `BACKEND_URL` | No | Backend origin (highest priority, overrides others) |
| `VITE_API_URL` | No | Backend API base URL (Vite - preferred) |
| `REACT_APP_API_URL` | No | Backend API base URL (CRA compatibility) |
| `REACT_APP_GITHUB_REPO` | No | Public repo identifier used in metadata |
| `REACT_APP_PUBLIC_URL` | No | Canonical public app URL |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public web-push key |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN, used only in production |
| `JWT_SECRET` | Yes (server-side) | JWT signing secret for Edge Middleware auth verification |
| `BLOCKED_COUNTRIES` | No (server-side) | Comma-separated ISO 3166-1 alpha-2 country codes to block |

Examples:

```env
VITE_API_URL=https://api.example.com
```

or:

```env
BACKEND_URL=https://api.example.com
```

**Backend Configuration**: All backend endpoint configuration is centralized in `src/config/backendConfig.js`. The system resolves backend URLs in priority order: `BACKEND_URL` → `VITE_API_URL` → `REACT_APP_API_URL`. In development, defaults to `http://localhost:8080`. In production, no automatic fallback - configuration must be explicitly set to avoid configuration drift.

Security note: never place private secrets in `REACT_APP_*` or `VITE_*` variables because they are exposed to the client bundle.

### Geographic Access Restrictions

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

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local dev server |
| `npm run start` | Alias to Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on `src/` |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Run Prettier on source files |
| `npm run test` | Run unit test suite |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run check` | Run lint + tests together (CI validation) |
| `npm run storybook` | Start Storybook |
| `npm run build-storybook` | Build Storybook static output |

## Testing and Quality

```bash
npm run lint
npm run test
npm run test:e2e
```

## SSE Mock Server (Optional)

For local realtime testing:

```bash
node sse-mock-server.js
```

Required environment variables:

- `JWT_SECRET` - JWT signing secret for token generation and validation. Generate with: `openssl rand -base64 32`

Optional environment flags:

- `SSE_MOCK_PORT` (default `8080`)
- `ALLOWED_ORIGIN` (default `http://localhost:3000`)
- `SSE_DEBUG` (`true` or `false`)

## Deployment

Vercel configuration is checked in via [`vercel.json`](vercel.json):

- Build command: `npm run lint && GENERATE_SOURCEMAP=false npm run build`
- Output directory: `build`
- `/api/*` is rewritten to the hosted Spring Boot backend (the sole API provider)
- No serverless functions are deployed — the `api/` directory was removed as dead code

## Documentation

- [Architecture and Roles](docs/ARCHITECTURE_AND_ROLES.md)
- [Environment Setup Guide](docs/ENV_SETUP_GUIDE.md)
- [Frontend Onboarding](docs/frontend-onboarding.md)
- [Security Migration Notes](docs/SECURITY_MIGRATION.md)
- [API Documentation Notes](docs/API_DOCUMENTATION.md)

## Contributing

- Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Open focused pull requests with clear scope and test notes
- Issues may be auto-unassigned after inactivity by workflow: [auto-unassign-stale-issues.yml](.github/workflows/auto-unassign-stale-issues.yml)

## License

Licensed under Apache 2.0. See [LICENSE](LICENSE).

## Contributors

<p align="left">
  <a href="https://github.com/SandeepVashishtha/Eventra/graphs/contributors">
    <img src="https://contrib.rocks/image?repo=SandeepVashishtha/Eventra&max=1000" alt="Contributors" />
  </a>
</p>

### Maintainers

<table>
<tr>
<td align="center">
<a href="https://github.com/sandeepvashishtha">
  <img src="https://avatars.githubusercontent.com/u/64915843?v=4" height="140px" width="140px" alt="Sandeep">
</a><br>
<sub><b>Sandeep Vashishtha</b><br>
<a href="https://www.linkedin.com/in/sandeepvashishtha/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" width="20" height="20" alt="LinkedIn"/>
</a>
</sub>
</td>
<td align="center">
<a href="https://github.com/RhythmPahwa14">
  <img src="https://avatars.githubusercontent.com/u/170720661?v=4" height="140px" width="140px" alt="Rhythm">
</a><br>
<sub><b>Rhythm</b><br>
<a href="https://www.linkedin.com/in/rhythmpahwa14/" target="_blank">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg" width="20" height="20" alt="LinkedIn"/>
</a>
</sub>
</td>
</tr>
</table>

## Mentor

Guidance and mentorship for the Eventra project are provided by the project leadership team. Contributors are encouraged to use GitHub Issues and Discussions for questions, suggestions, and collaboration.

## Star History

<a href="https://www.star-history.com/?repos=sandeepvashishtha%2Feventra&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
 </picture>
</a>

Built by the Eventra community.

---
