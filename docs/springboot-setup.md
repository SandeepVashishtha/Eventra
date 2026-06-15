# Spring Boot Backend Setup Guide

This documentation outlines the steps required to configure and run the Eventra Spring Boot API service locally.

## Prerequisites

- **JDK 17**: Ensure Java 17 LTS is installed in your path.
- **Maven**: Standard build and package manager.
- **PostgreSQL**: Local or Dockerized database engine.

## Configuration

1. Copy `api/.env.example` → `api/.env` and configure your database credentials.
2. Configure Spring active profiles using `spring.profiles.active=dev`.

## Running the API

Execute the Maven compile and run target from the `api/` directory:

```bash
mvn spring-boot:run
```
