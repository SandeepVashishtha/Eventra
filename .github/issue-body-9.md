## Target
**Location:** Repository root
**Category:** DevOps | **Level:** Intermediate

## The Issue
The repository has a `.dockerignore` file but no `Dockerfile` or `docker-compose.yml`. The `.dockerignore` exists as a leftover with content that suggests a Node production build, but there is no way to containerize the application for deployment.

## The Impact
Without a Dockerfile:
- Developers cannot run the app in a consistent containerized environment (different Node/npm versions cause "works on my machine" issues).
- CI/CD pipelines have no standardized build artifact — each deployment method must implement build steps from scratch.
- The existing `.dockerignore` is dead configuration that may confuse contributors.

## Suggested Fix
Add a multi-stage `Dockerfile` that:
1. **Stage 1 (build):** Uses `node:22-alpine`, installs dependencies, runs the build.
2. **Stage 2 (serve):** Uses `nginx:alpine` (for CRA/Vite builds) or `node:22-alpine` (for Next.js), copies only the built artifacts.

Also add a `docker-compose.yml` if the app depends on backend services (defined via environment variables) for local development convenience.
