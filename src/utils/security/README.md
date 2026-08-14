# Security Utilities

This directory contains client-side security mechanisms for input validation, sanitization, CSRF token management, and audit logs.

## Logger Usage

```js
import { logAuthEvent } from './authAuditLogger';

logAuthEvent("WARNING", "JWT expiration threshold crossed (within 5m)", { userId: 42 });
```
