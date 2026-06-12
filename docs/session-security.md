# Session and JWT Security Guide

Best practices for protecting sessions, API endpoints, and user credentials in Eventra.

## 1. Token Storage
Do NOT store authentication JWTs in vulnerable `localStorage` slots. Use secure, `HttpOnly` and `SameSite=Strict` cookies to mitigate XSS vector vulnerabilities.

## 2. Expirations
- **Access Token**: Short life (15 minutes maximum).
- **Refresh Token**: Stored securely in database with rotation policy enabled.