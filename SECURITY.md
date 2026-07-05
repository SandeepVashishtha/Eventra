# Security Policy

## Supported Versions

We recommend updating to the latest stable release to receive security patches.

| Version | Supported |
| ------- | --------- |
| Latest  | ✅ Yes     |
| < Latest| ❌ No      |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please do not open a public issue. Instead, report it responsibly by contacting the maintainers directly or raising a private security advisory. We will investigate and address the issue as soon as possible.


### JWT Refresh Token Expiration Rules
- Enforce secure cookie attributes for persistent auth sessions.

## Request Integrity Validation

Outgoing API requests automatically include an `X-Request-Integrity` header generated from a SHA-256 checksum of the request payload.

### Purpose

- Detect accidental payload modifications during development.
- Provide a consistent integrity header for debugging.
- Establish a foundation for future backend verification.

### Notes

This mechanism is intended for development and debugging purposes. It complements existing transport security (HTTPS) but does not replace server-side request validation or authentication.