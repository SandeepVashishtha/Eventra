# Rate Limiter Migration Guide

## Overview

The in-memory rate limiter has been replaced with a distributed rate limiter that works correctly in production environments (serverless, multi-instance, auto-scaling).

## What Changed

### Before
- In-memory Map-based storage
- Counters reset on server restart/cold start
- No sharing between instances
- Silent failures in production

### After
- Distributed storage (Redis/Upstash)
- Counters persist across restarts
- Shared state across all instances
- Fail-closed behavior in production
- Backwards-compatible API (sync for memory, async for distributed)

## Breaking Changes

### API Changes

The public API is backwards compatible:
- **In-memory backend**: Supports both sync `check()` and async `checkAsync()`
- **Distributed backends**: Only support async `check()`, throw error on sync `check()`

```javascript
// Works for in-memory (sync)
const result = limiter.check(key);

// Works for both (async)
const result = await limiter.check(key);

// Works for both (async)
const result = await limiter.checkAsync(key);
```

### Production Restrictions

- `RATE_LIMIT_MODE=memory` is **NOT allowed** in production
- Build validation will FAIL if distributed storage is missing in production
- Runtime will reject requests if misconfigured

### Updated Files

- `api/lib/rateLimiter.js` - Complete rewrite with distributed backends
- `api/auth/login.js` - Updated to handle both sync and async rate limiters
- `api/auth/signup.js` - Updated to handle both sync and async rate limiters
- `scripts/validate-env.js` - Updated to fail build if distributed storage missing in production

## Migration Steps

### 1. Update Environment Variables

Add distributed storage configuration to your environment:

**For Vercel deployments (Upstash Redis):**
```env
KV_REST_API_URL=https://your-redis-instance.upstash.io
KV_REST_API_TOKEN=your-redis-rest-token
```

Note: Vercel KV was migrated to Upstash Redis in December 2024.

**For self-hosted Redis/Upstash:**
```env
RATE_LIMIT_REDIS_URL=redis://user:password@host:port
# or with TLS:
RATE_LIMIT_REDIS_URL=rediss://user:password@host:port
```

**For development/testing:**
- No changes required - automatically uses in-memory fallback
- Can explicitly set `RATE_LIMIT_MODE=memory` for testing
- `RATE_LIMIT_MODE=memory` is NOT allowed in production

### 2. Update Calling Code (Optional)

The existing code will continue to work for in-memory backend. For distributed backends, use async:

```javascript
// Works for in-memory (sync)
const result = limiter.check(key);

// Recommended for both (async)
const result = await limiter.check(key);
```

The `login.js` and `signup.js` files have been updated to handle both cases automatically:

```javascript
const rateLimitResult = limiter.checkAsync
  ? await limiter.checkAsync(clientIp)
  : limiter.check(clientIp);
```

### 3. Update Error Handling

The rate limiter now throws errors on distributed storage failures:

```javascript
try {
  await enforceRateLimit(limiter, clientIp);
  // Proceed with request
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    return res.status(429).json({ error: 'Too many requests' });
  } else {
    // Rate limiting service unavailable
    console.error('Rate limit check failed:', error.message);
    return res.status(500).json({ error: 'Service unavailable' });
  }
}
```

### 4. Validate Configuration

Run environment validation:

```bash
npm run validate-env
```

This will **FAIL** if distributed storage is not configured in production or if `RATE_LIMIT_MODE=memory` is set in production.

## Configuration Options

| Variable | Required | Purpose |
| --- | --- | --- |
| `RATE_LIMIT_REDIS_URL` | Production (one of) | Redis connection URL |
| `KV_REST_API_URL` | Production (one of) | Upstash Redis REST API URL |
| `KV_REST_API_TOKEN` | Production (with KV) | Upstash Redis REST API token |
| `RATE_LIMIT_MODE` | Optional | Override: "distributed" or "memory" (dev/test only) |

## Security Properties

- **Fail-Closed**: Production rejects requests when distributed storage is unavailable
- **Build-Time Validation**: Build fails if distributed storage missing in production
- **Atomic Operations**: Uses Redis Lua scripts or Upstash atomic operations to prevent race conditions
- **Shared State**: Counters persist across serverless cold starts and container restarts
- **Multi-Instance Safety**: All instances enforce the same limits
- **Production Enforcement**: `RATE_LIMIT_MODE=memory` is blocked in production

## Testing

Run the distributed rate limiter tests:

```bash
node --test tests/distributedRateLimiter.test.mjs
```

Tests cover:
- In-memory backend (development/test)
- Backwards compatibility (sync and async)
- Production fail-closed behavior
- Configuration validation
- Pre-configured limiters (login/signup)
- Rate limit enforcement
- Counter expiration
- Multiple IPs
- Distributed backend selection

## Troubleshooting

### Build fails with "Production requires distributed rate limiting"

**Cause**: No distributed storage configured in production environment.

**Solution**: Set `RATE_LIMIT_REDIS_URL` or `KV_REST_API_URL`/`KV_REST_API_TOKEN`.

### Build fails with "RATE_LIMIT_MODE=memory is not allowed in production"

**Cause**: `RATE_LIMIT_MODE=memory` is set in production.

**Solution**: Remove this setting. Use distributed storage only in production.

### "Rate limiting is not configured" in production

**Cause**: No distributed storage configured in production environment.

**Solution**: Set `RATE_LIMIT_REDIS_URL` or `KV_REST_API_URL`/`KV_REST_API_TOKEN`.

### "Redis connection failed"

**Cause**: Redis server unreachable or invalid credentials.

**Solution**: Verify `RATE_LIMIT_REDIS_URL` is correct and Redis is accessible.

### "KV rate limit check failed"

**Cause**: Upstash Redis API error or invalid credentials.

**Solution**: Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are correct.

### "Synchronous check not supported for distributed rate limiter"

**Cause**: Calling `limiter.check(key)` (sync) on a distributed backend.

**Solution**: Use `await limiter.check(key)` instead.

## Rollback

If you need to rollback to the in-memory implementation:

1. Set `RATE_LIMIT_MODE=memory` in your environment
2. Note: This is NOT allowed in production due to security implications
3. Build validation will fail in production with this setting

## Support

For issues or questions:
- Check `docs/SECURITY_ARCHITECTURE.md` for architecture details
- Check `docs/ENV_SETUP_GUIDE.md` for environment setup
- Review `tests/distributedRateLimiter.test.mjs` for usage examples
