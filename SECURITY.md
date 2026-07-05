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

## Client-side Security Configuration Validation

Eventra performs a lightweight validation of important client-side security configuration during application startup.

The validator checks:

- HTTPS API endpoint configuration
- Required environment variables
- Authentication configuration
- Content Security Policy (CSP) presence

The validation utility reports configuration warnings during development to help contributors identify missing or insecure settings. It complements existing backend security controls and should not be considered a replacement for server-side validation.
