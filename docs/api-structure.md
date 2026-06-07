# API Endpoint and Security Guide

Documentation of key endpoints, authentication headers, and request-response payloads for the Eventra API.

## Authentication

All secure endpoints require the standard Bearer token header:
`Authorization: Bearer <jwt-token>`

## Core Endpoints

- `POST /api/auth/login`: Authenticate and receive JWT token.
- `GET /api/events`: List all active, public events.
- `POST /api/events`: Create a new event (Organizers only).
