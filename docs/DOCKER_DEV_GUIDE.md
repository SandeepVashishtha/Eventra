## Docker-Based Local Development

> [!TIP]
> Use Docker Compose when you want a fully isolated local environment without installing Node.js or the Java JDK on your machine.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 24.x or later
- [Docker Compose](https://docs.docker.com/compose/) v2 (bundled with Docker Desktop)

---

### 1. Clone the repository

```bash
git clone https://github.com/SandeepVashishtha/Eventra.git
cd Eventra
```

---

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
VITE_API_URL=http://localhost:8080
JWT_SECRET=<your-generated-secret>
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
# or on Windows PowerShell:
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

---

### 3. Build and start the frontend container

The project ships with a ready-to-use `Dockerfile`:

```bash
# Build the Docker image
docker build -t eventra-frontend .

# Run the container, mapping port 3000
docker run --rm -p 3000:3000 --env-file .env eventra-frontend
```

The app will be available at **http://localhost:3000**.

---

### 4. Docker Compose (frontend + mock API)

For a fully self-contained stack including the mock SSE server, use Docker Compose:

```yaml
# docker-compose.yml (place in project root)
version: "3.9"

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=development
    depends_on:
      - mock-api

  mock-api:
    image: node:22-alpine
    working_dir: /app
    volumes:
      - .:/app
    command: node sse-mock-server.js
    ports:
      - "4001:4001"
    environment:
      - SSE_MOCK_PORT=4001
      - ALLOWED_ORIGIN=http://localhost:3000
      - SSE_DEBUG=false
```

Start everything with:

```bash
docker compose up --build
```

Stop and clean up:

```bash
docker compose down
```

---

### 5. Hot-reload in Docker (development mode)

To enable hot-reload (HMR) while editing source files locally, use a bind-mount override:

```bash
docker run --rm \
  -p 3000:3000 \
  -v "$(pwd)/src:/app/src" \
  --env-file .env \
  eventra-frontend \
  npm run dev -- --host 0.0.0.0
```

> [!NOTE]
> On Windows with Docker Desktop, replace `$(pwd)` with the absolute Windows path:
> ```powershell
> docker run --rm -p 3000:3000 -v "${PWD}/src:/app/src" --env-file .env eventra-frontend npm run dev -- --host 0.0.0.0
> ```

---

### 6. Running tests inside Docker

```bash
# Unit tests
docker run --rm --env-file .env eventra-frontend npm test

# Lint
docker run --rm --env-file .env eventra-frontend npm run lint
```

---

### 7. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `EACCES: permission denied` on port 3000 | Port already in use | `lsof -i :3000` and kill the process, or change the host port in `-p` |
| HMR not working | Volume not mounted | Ensure `src/` is bind-mounted and Vite is started with `--host 0.0.0.0` |
| API calls failing | `VITE_API_URL` not set | Verify `.env` is being passed via `--env-file` |
| Container exits immediately | Missing `JWT_SECRET` | Generate and set `JWT_SECRET` in `.env` |
| `docker compose` command not found | Old Docker version | Upgrade to Docker Desktop 4.x which bundles Compose v2 |
