# Secure Deployment Checklist

This checklist helps contributors verify that essential security configurations are correctly applied before deploying Eventra to production.

---

# Pre-Deployment Checklist

Review each item before every production deployment.

## HTTPS Configuration

- [ ] HTTPS is enabled for all production traffic.
- [ ] HTTP requests are redirected to HTTPS.
- [ ] TLS certificates are valid and up to date.

---

## Security Headers

Verify that the following headers are configured correctly:

- [ ] Content-Security-Policy (CSP)
- [ ] Strict-Transport-Security (HSTS)
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] X-Frame-Options
- [ ] Permissions-Policy

---

## Environment Variables

- [ ] All required environment variables are configured.
- [ ] Production secrets are stored securely.
- [ ] No development credentials are used.
- [ ] `.env` files are excluded from version control.

---

## Content Security Policy (CSP)

- [ ] CSP is enabled.
- [ ] Only trusted domains are whitelisted.
- [ ] No unnecessary `unsafe-inline` or `unsafe-eval` directives are present.

---

## Rate Limiting

- [ ] Rate limiting is enabled.
- [ ] Authentication endpoints are protected.
- [ ] API rate limits have been verified.

---

## Secret Scanning

- [ ] Repository passes secret scanning.
- [ ] No credentials are committed.
- [ ] Compromised credentials have been rotated.

---

## Dependency Security

- [ ] Dependencies are up to date.
- [ ] Security vulnerabilities have been reviewed.
- [ ] High and Critical vulnerabilities are resolved.

---

## JWT Authentication

- [ ] JWT secret is securely configured.
- [ ] Token expiration settings are verified.
- [ ] Secure cookie settings are enabled.
- [ ] Authentication flows have been tested.

---

## Final Verification

Before deployment, confirm that:

- [ ] Application builds successfully.
- [ ] Security documentation has been reviewed.
- [ ] Production configuration matches deployment requirements.
- [ ] Monitoring and logging are enabled.

---

# Additional Resources

- SECURITY.md
- docs/SECURITY_TROUBLESHOOTING.md
- docs/ENVIRONMENT_SECURITY.md