# Security Policy

## Overview

Eventra implements enterprise-grade security practices to protect user data and system integrity. For comprehensive details on authentication, authorization, and security features, see the [Architecture & Roles Guide](docs/ARCHITECTURE_AND_ROLES.md#-route-protection--authentication-flow).

**Key Security Features:**
- 🔐 JWT-based authentication with token validation
- 🛡️ Role-Based Access Control (RBAC) with 5 roles and granular permissions
- 🔒 Secure session storage and recovery
- 🌐 HTTPS enforcement with security headers
- 🚫 Input validation and XSS protection
- 📋 Session expiry and automatic logout

---

## Supported Versions

We support the latest version of Eventra. Please update to the latest release to receive security updates.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

---

## Security Architecture

**Authentication & Authorization:**
- JWT tokens stored securely in sessionStorage (cleared on browser close)
- Refresh tokens stored server-side with httpOnly cookies
- Automatic session recovery on page reload
- Permission checks on both frontend (UX) and backend (security)

**Data Protection:**
- HTTPS-only communication
- Secure headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Encrypted sensitive data in localStorage
- Offline-first request queuing for network resilience

**For detailed security information, refer to:**
- [Environment Setup & Security](docs/ENV_SETUP_GUIDE.md#-deployment--security-guidelines) – Safe vs unsafe environment variables, deployment secrets checklist
- [SECURITY_MIGRATION.md](SECURITY_MIGRATION.md) – Security updates and migration guide
- [Architecture & Roles: Security Measures](docs/ARCHITECTURE_AND_ROLES.md#security-measures)

---

## Reporting a Vulnerability

We take security bugs in Eventra seriously. If you find a security vulnerability, please do not open a public issue. Instead, report it responsibly by emailing us at SandeepVashishtha@outlook.in.

Please include details about:
- The type of vulnerability.
- Steps to reproduce the issue.
- Any potential impact.
- Affected versions (if known).
- Suggested remediation steps (if you have them).

We will acknowledge your report within 48 hours and work with you to resolve the issue as quickly as possible.

---

## Security Best Practices for Contributors

When contributing to Eventra, please follow these security guidelines:

### 1. Authentication & Authorization
- Always validate permissions on both frontend and backend
- Use `<ProtectedRoute>` for protected pages
- Check `useAuth()` hook for current user role and scopes
- Never trust client-side permission checks alone

### 2. API Calls
- Validate all user input before sending to backend
- Use the centralized Axios configuration in `src/config/api.js`
- Include JWT token in Authorization header
- Handle 401 responses by clearing session

### 3. Data Storage
- Store sensitive data (JWT tokens) in sessionStorage only
- Use encrypted storage for persistent data via `secureStorage.js`
- Never hardcode API keys or secrets in frontend code
- Use environment variables for configuration

### 4. Error Handling
- Don't expose sensitive information in error messages
- Log security-related events for audit trails
- Implement rate limiting for sensitive operations
- Handle network timeouts gracefully

### 5. Code Review
- Security-focused code review checklist available in [CONTRIBUTING.md](CONTRIBUTING.md)
- All PRs require approval before merging
- Focus on permission checks and input validation
- Test with multiple user roles

---

## Known Security Considerations

1. **CORS Configuration** - Configured to only accept requests from authorized origins
2. **CSRF Protection** - Handled by same-site cookie policy
3. **SQL Injection** - Backend uses parameterized queries
4. **XSS Prevention** - React's built-in XSS protection + Content Security Policy headers
5. **HTTPS Enforcement** - Production environment uses HTTPS only

---

## Reporting Security Issues

For security concerns or vulnerability reports, please **do not** open public GitHub issues. Instead:

1. **Email:** SandeepVashishtha@outlook.in
2. **Subject:** [SECURITY] Vulnerability Report
3. **Include:**
   - Detailed description
   - Reproduction steps
   - Impact assessment
   - Suggested fix (optional)

We will respond within 48 hours and coordinate responsible disclosure.

---

## Additional Resources

- [Architecture & Roles Guide](docs/ARCHITECTURE_AND_ROLES.md) – Complete system design
- [SECURITY_MIGRATION.md](SECURITY_MIGRATION.md) – Security updates history
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) – Community standards
- [CONTRIBUTING.md](CONTRIBUTING.md) – Contribution guidelines
