# Authentication Rate Limiting

## Overview

Eventra implements client-side protections for authentication flows to reduce rapid repeated submissions and improve user experience.

## Features

- Request throttling for login attempts
- Temporary client-side lockouts
- Exponential backoff after repeated failures
- Retry countdown messages
- Automatic disabling of submit buttons during authentication requests
- Respect for server-provided Retry-After headers

## Security Benefits

- Reduces brute-force attempts
- Prevents accidental repeated submissions
- Decreases unnecessary backend load
- Improves authentication feedback

## Limitations

Client-side rate limiting is an additional usability and security layer and does not replace backend authentication protections.

---

## Session KV Failure Mode Configuration

### Overview

This project uses Upstash KV (distributed session storage) to track user session state, inactivity timeouts, and risk scores across distributed deployments. The `SESSION_KV_FAILURE_MODE` environment variable controls how the authentication middleware responds when KV is unavailable.

### Environment Variable: `SESSION_KV_FAILURE_MODE`

**Type:** `string`  
**Valid Values:** `fail_open` (default), `fail_closed`  
**Location:** Set in `.env` or deployment platform environment variables

### Failure Mode Behaviors

#### `fail_open` (Default)

**When KV is unavailable:**
- JWT signature and expiration are still validated locally
- If JWT is valid, the request is allowed through
- `req.sessionRiskChecked` is set to `false` to indicate session state was not verified
- Structured warning is logged with userId and reason

**Pros:**
- ✅ Prevents KV outages from authenticating all users
- ✅ Maintains service availability during infrastructure issues
- ✅ Better user experience during degraded scenarios

**Cons:**
- ⚠️ Session inactivity timeouts (2-hour limit) are not enforced during KV outage
- ⚠️ Invalidated sessions may not be detected until KV recovers
- **Mitigation:** JWT expiration (default 1 hour) provides a built-in safety window

**When to use:**
- Production environments where availability is critical
- High-traffic systems where KV outages are a known risk
- When JWT expiration (1 hour default) is acceptable as a session safety net

#### `fail_closed` (Strict Mode)

**When KV is unavailable:**
- All authenticated requests return HTTP 401 with code `REQUIRES_REAUTH`
- Users are logged out until KV recovers
- Behavior identical to previous implementation

**Pros:**
- ✅ Maximum security: all session state checks always enforced
- ✅ No stale session risk during outages
- ✅ Predictable deterministic behavior

**Cons:**
- ❌ Makes KV a single point of failure for authentication
- ❌ Service-wide logout during any KV issue
- ❌ Poor user experience during infrastructure degradation

**When to use:**
- Development/testing environments
- Compliance scenarios requiring strict session validation
- Very low-traffic systems where KV reliability is guaranteed
- Environments where security overrides availability

### Configuration Examples

#### Production (Recommended)

```bash
# .env.production
SESSION_KV_FAILURE_MODE=fail_open
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-secure-token
```

#### Development

```bash
# .env.development
SESSION_KV_FAILURE_MODE=fail_open
# KV credentials optional in dev
```

#### High-Security Deployment

```bash
# .env.production.secure
SESSION_KV_FAILURE_MODE=fail_closed
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-secure-token
```

### KV Health Cache

To prevent a thundering herd of KV requests during outages, the middleware caches KV health status for **30 seconds**. This means:

- If KV becomes unavailable, only the first request triggers a health check
- Subsequent requests within 30 seconds use the cached "unavailable" state
- After 30 seconds, a new health check is attempted
- This dramatically reduces load on KV and log volume during outages

### Monitoring and Alerts

When `fail_open` mode is active and KV is unavailable, structured warning logs are emitted with:

```json
{
  "level": "warn",
  "message": "KV unavailable, allowing JWT-valid request (fail_open mode)",
  "reason": "kv_unavailable",
  "userId": "user-id-here",
  "mode": "fail_open",
  "jwtValid": true,
  "kvStatus": 500
}
```

**Recommended alerts:**
- Alert if `kv_unavailable` warnings exceed 10 per minute (indicates degraded state)
- Page on-call if `fail_closed` mode logs `requires_reauth` (indicates outage in strict mode)
- Monitor KV latency; if health checks start timing out, consider increasing cache TTL