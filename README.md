# Eventra

Modern event and hackathon platform for communities, organizers, and contributors.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)

## Overview

Eventra is an open-source frontend application built with React and Vite. It supports event discovery, registration, dashboards, hackathons, collaboration features, feedback flows, and role-based access experiences.

This repository contains the frontend and serverless API helpers under `api/`.
The Spring Boot backend is maintained in a separate repository.

- Frontend repo: https://github.com/SandeepVashishtha/Eventra
- Backend repo: https://github.com/SandeepVashishtha/Eventra-Backend
- Backend API base: https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net
- Swagger: https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html

## Key Features

- Event and hackathon discovery, filtering, and registration flows
- Auth-aware routes with protected pages and role-aware behavior
- Dashboard and profile surfaces for users and organizers
- Real-time and offline-friendly UX utilities
- Feedback, recommendation, and community engagement modules
- Extensive utility and behavior test coverage

## Tech Stack

- React 19
- React Router 7
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Lucide React
- Playwright (E2E)
- ESLint and Prettier

## Project Structure

```text
Eventra/
|-- api/                 # Serverless API routes and middleware
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

2. Create your env file:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000` (configured in `vite.config.js`).

## Environment Variables

Use `.env.example` as the source of truth.

| Variable | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | Yes | Backend API base URL |
| `REACT_APP_USE_REAL_API` | No | Toggle real API vs local/mock flows |
| `REACT_APP_SSE_URL` | No | Override SSE endpoint |
| `DAYS_THRESHOLD` | No | Date threshold used by selected features |
| `REACT_APP_EMAILJS_PUBLIC_KEY` | No | EmailJS integration |
| `REACT_APP_EMAILJS_SERVICE_ID` | No | EmailJS integration |
| `REACT_APP_EMAILJS_TEMPLATE_ID` | No | EmailJS integration |
| `REACT_APP_FACEBOOK_APP_ID` | No | Facebook integration |
| `REACT_APP_SENTRY_DSN` | No | Client telemetry/error reporting |
| `VITE_GOOGLE_CLIENT_ID` | No | Google client ID |

Security note: never place private secrets in `REACT_APP_*` or `VITE_*` variables because they are exposed to the client bundle.

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

Optional environment flags:

- `SSE_MOCK_PORT` (default `4001`)
- `ALLOWED_ORIGIN` (default `http://localhost:3000`)
- `SSE_DEBUG` (`true` or `false`)

## Deployment

Vercel configuration is checked in via [`vercel.json`](vercel.json):

- Build command: `npm run lint && GENERATE_SOURCEMAP=false npm run build`
- Output directory: `build`
- `/api/*` is rewritten to the hosted Spring Boot backend

## Documentation

- [Architecture and Roles](docs/ARCHITECTURE_AND_ROLES.md)
- [Environment Setup Guide](docs/ENV_SETUP_GUIDE.md)
- [Frontend Onboarding](docs/frontend-onboarding.md)
- [Security Migration Notes](docs/SECURITY_MIGRATION.md)
- [API Documentation Notes](docs/API_DOCUMENTATION.md)

## Contributing

- Read [CONTRIBUTING.md](CONTRIBUTING.md)
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

## Star History

<a href="https://www.star-history.com/?repos=sandeepvashishtha%2Feventra&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=sandeepvashishtha/eventra&type=date&legend=top-left" />
 </picture>
</a>

Built by the Eventra community.
