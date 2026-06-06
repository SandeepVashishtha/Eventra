# Eventra

Modern event and hackathon platform for communities, organizers, and contributors.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg)](https://vitejs.dev/)

---

> [!IMPORTANT]
>
> ## Project Status Notice
>
> Due to time constraints and other commitments, **I ([@SandeepVashishtha](https://github.com/SandeepVashishtha)) will no longer be actively contributing to or managing this project** going forward. I sincerely apologize for any inconvenience this may cause to contributors and users.
>
> **The project will NOT be archived** - it remains open and active, especially for **GSSoC 2026** participants and the broader open-source community.
>
> There are mentors currently involved, and the project can continue to grow with community support. However, **we are looking for 2-3 dedicated volunteers to step up as maintainers** to help review PRs, triage issues, and guide contributors.
>
> ### Interested in becoming a maintainer?
>
> If you are passionate about this project and willing to take on a maintainer role, please reach out by:
>
> - Opening an issue titled **"Maintainer Volunteer - [Your Name]"**
> - Or contacting via the existing community channels
>
> Your contributions and leadership would mean a lot to this project and the community around it. 🙏

---

## Overview

Eventra is an open-source frontend application built with React and Vite. It supports event discovery, registration, dashboards, hackathons, collaboration features, feedback flows, and role-based access experiences.

This repository contains the frontend and serverless API helpers under `api/`.
The Spring Boot backend is maintained in a separate repository.

- Frontend repo: <https://github.com/SandeepVashishtha/Eventra>
- Backend repo: <https://github.com/SandeepVashishtha/Eventra-Backend>
- Backend API base: <https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net>
- Swagger: <https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net/swagger-ui/index.html>

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

1. Create your env file:

```bash
cp .env.example .env
```

1. Start dev server:

```bash
npm run dev
```

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
docker-compose up eventra-dev
```

The app will be available at `http://localhost:3000` with hot-reloading enabled.

1. Build and test the production container locally:

```bash
docker-compose up --build eventra-prod
```

The production-optimized build will be served via Nginx at `http://localhost:8080`.

## Environment Variables

Use `.env.example` as the source of truth.

| Variable | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_API_URL` | Yes | Backend API base URL used by client requests and SSE streams |
| `REACT_APP_GITHUB_REPO` | No | Public repo identifier used in metadata |
| `REACT_APP_PUBLIC_URL` | No | Canonical public app URL |
| `REACT_APP_VAPID_PUBLIC_KEY` | No | Public web-push key |
| `REACT_APP_CSP_REPORT_URI` | No | CSP report endpoint |
| `REACT_APP_SENTRY_DSN` | No | Sentry browser error reporting DSN, used only in production |

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

---

## 🧑‍🏫 Mentor

This project is mentored under **GSSoC'26** by:

<table>
<tr>
<td align="center">
<a href="https://github.com/Ayushh-Sharmaa">
  <img src="https://avatars.githubusercontent.com/Ayushh-Sharmaa?v=4" height="140px" width="140px" alt="Ayush Sharma" style="border-radius:50%"/>
</a><br>
<sub><b>Ayush Sharma</b><br>
<i>GSSoC'26 Mentor · Eventra</i><br><br>
<a href="https://github.com/Ayushh-Sharmaa" target="_blank">
  <img src="https://img.shields.io/badge/GitHub-Ayushh--Sharmaa-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"/>
</a>
&nbsp;
<a href="https://www.linkedin.com/in/ayushh-sharmaa/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-ayushh--sharmaa-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"/>
</a>
</sub>
</td>
</tr>
</table>

> 💬 Have questions about contributing or the project? Reach out to the mentor on [LinkedIn](https://www.linkedin.com/in/ayushh-sharmaa/) or via the [GSSoC Discord](https://discord.gg/6MQ9r5nHT).
