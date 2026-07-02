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

## Authentication Audit Logging

Eventra includes a lightweight client-side authentication audit utility located at:

```text
src/utils/security/authAudit.js
```

The utility provides a consistent way to record authentication-related events during application runtime.

### Supported Events

- Login Success
- Login Failure
- Logout
- Session Expiration

Each audit entry includes:

- Event type
- Timestamp (ISO 8601)
- Browser information
- Platform information
- Language
- Timezone
- Optional event metadata

### Purpose

The audit utility is intended to:

- Help developers debug authentication flows.
- Provide a consistent structure for authentication event logging.
- Serve as a foundation for future server-side audit integrations.

### Limitations

- Audit records are stored locally in the browser.
- Client-side audit logs should not be considered a source of truth.
- They do not replace server-side authentication logs or security monitoring.