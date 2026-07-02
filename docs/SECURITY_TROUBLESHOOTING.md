# Security Troubleshooting Guide

This guide helps contributors diagnose and resolve common security-related issues encountered during local development and deployment.

---

# 1. Content Security Policy (CSP) Violations

## Symptoms

- Browser console reports CSP errors.
- Scripts, styles, or images fail to load.
- Third-party integrations stop working.

## Possible Causes

- Missing CSP directives.
- Inline scripts or styles blocked.
- External resources not included in the CSP configuration.

## Resolution

- Review the browser developer console.
- Verify the Content-Security-Policy configuration.
- Ensure trusted domains are included.
- Avoid inline JavaScript whenever possible.

---

# 2. Missing Environment Variables

## Symptoms

- Application fails during startup.
- API requests return authorization errors.
- Authentication features do not work.

## Resolution

- Verify your `.env` configuration.
- Ensure all required environment variables are present.
- Restart the development server after updating environment variables.

---

# 3. JWT Authentication Issues

## Symptoms

- Login succeeds but protected routes fail.
- Users are unexpectedly logged out.
- Invalid or expired token errors appear.

## Resolution

- Verify the JWT secret configuration.
- Confirm token expiration settings.
- Clear browser storage and authenticate again.
- Ensure authentication cookies are being sent correctly.

---

# 4. Vite Proxy Configuration

## Symptoms

- API requests return 404 or CORS errors.
- Backend endpoints cannot be reached.

## Resolution

- Check the Vite proxy configuration.
- Ensure backend services are running.
- Verify API base URLs.
- Confirm proxy target configuration.

---

# 5. Rate Limiting

## Symptoms

- HTTP 429 responses.
- Temporary request blocking.

## Resolution

- Reduce request frequency.
- Wait for the rate-limit window to reset.
- Review local development rate-limit configuration.

---

# 6. Secret Scanning Failures

## Symptoms

- GitHub blocks a push.
- CI security checks fail.

## Resolution

- Remove exposed credentials immediately.
- Rotate compromised secrets.
- Replace secrets with environment variables.
- Verify the repository contains no hard-coded credentials.

---

# Best Practices

- Never commit secrets.
- Keep dependencies updated.
- Use HTTPS whenever possible.
- Validate security headers before deployment.
- Follow the repository's security guidelines.