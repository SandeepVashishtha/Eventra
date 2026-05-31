# Docker Deployment Troubleshooting Guide

Resolutions for common errors encountered during local containerized setups of Eventra.

## 1. Port Allocation Conflicts
If `localhost:8080` or `localhost:3000` is already in use, modify the port mapping attributes in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"
```

## 2. PostgreSQL Connection Failures
Ensure that database service containers have fully completed initialization before boot-up of the Spring Boot application container.