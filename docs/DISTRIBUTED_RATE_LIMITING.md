# Distributed Rate Limiting Architecture

## Overview

Eventra implements production-grade distributed rate limiting to prevent brute-force attacks, credential stuffing, and rate-limit bypass across multiple serverless instances. This document describes the architecture, implementation, and security considerations.

## Problem Statement

The original implementation used instance-local in-memory storage (`new Map()`) for rate limiting. This approach has critical security vulnerabilities in distributed deployments:

- **Instance Hopping**: Attackers can bypass rate limits by distributing requests across multiple serverless instances
- **Cold Start Reset**: Rate-limit state is lost on every serverless cold start
- **No Shared State**: Each instance maintains independent counters, allowing coordinated attacks
- **Horizontal Scaling Bypass**: Load-balanced deployments cannot enforce consistent rate limits

## Solution Architecture

### Design Principles

1. **Fail-Closed Security**: Rate limiting rejects requests in production if distributed storage is unavailable
2. **Atomic Operations**: Uses Redis INCR with EXPIRE to prevent race conditions
3. **Environment-Aware**: Automatic fallback to in-memory storage for development/testing
4. **Backward Compatible**: Existing API surface preserved for minimal migration impact
5. **SOLID Principles**: Clean separation of concerns with dedicated modules

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Endpoints                  │
│                  (login.js, signup.js)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rate Limiter Interface                     │
│                   (api/lib/rateLimiter.js)                    │
│  - createRateLimiter(windowMs, maxRequests)                  │
│  - enforceRateLimit(limiter, key)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Storage Abstraction Layer                     │
│              (api/lib/rate-limit-storage.js)                  │
│  - incrementWithExpiration(key, windowMs)                     │
│  - Redis/Vercel KV (production)                              │
│  - In-memory Map (development/test)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Configuration Validation Layer                   │
│            (api/lib/rate-limit-config.js)                     │
│  - isDistributedRateLimitStorageConfigured()                 │
│  - assertDistributedRateLimitStorageConfigured()             │
│  - isInMemoryRateLimitStorageAllowed()                       │
└─────────────────────────────────────────────────────────────┘
```

### Module Responsibilities

#### rate-limit-config.js

Configuration validation and environment-aware storage selection:

- `isDistributedRateLimitStorageConfigured()`: Checks if KV_REST_API_URL and KV_REST_API_TOKEN are set
- `assertDistributedRateLimitStorageConfigured()`: Fails fast in production if distributed storage is not configured
- `isInMemoryRateLimitStorageAllowed()`: Returns true only in non-production environments

#### rate-limit-storage.js

Unified storage interface with automatic backend selection:

- **Redis/Vercel KV**: Used when KV_REST_API_URL and KV_REST_API_TOKEN are configured
- **In-Memory Fallback**: Used in development/test when distributed storage is unavailable
- **Atomic Operations**: Uses Redis pipeline for INCR + PEXPIRE to prevent race conditions
- **Error Handling**: Production requests rejected on storage failure; development requests allowed with warning

Key operations:
- `incrementWithExpiration(key, windowMs)`: Atomically increments counter with expiration
- `resetKey(key)`: Resets a specific key (for testing)
- `clearAll()`: Clears all rate-limit data (for testing)
- `close()`: Gracefully closes Redis connection

#### rateLimiter.js

Rate-limiting logic with distributed storage:

- `createRateLimiter(windowMs, maxRequests)`: Creates a rate limiter instance
- `enforceRateLimit(limiter, key)`: Throws error if rate limit exceeded
- `loginRateLimiter`: Pre-configured limiter (10 requests/minute)
- Fail-closed behavior: Returns `allowed: false` if storage unavailable in production

## Security Guarantees

### Production Security

1. **Fail-Closed**: Authentication requests are rejected with 429 if distributed storage is unavailable
2. **No Silent Fallback**: Never allows unlimited requests in production
3. **Atomic Operations**: Redis pipeline prevents race conditions during concurrent requests
4. **Shared State**: All instances share the same rate-limit state via Redis/KV

### Development/Testing Security

1. **In-Memory Storage**: Allowed for convenience in non-production environments
2. **Warning Logs**: Storage unavailability logged but requests allowed
3. **Test Isolation**: ClearAll() function enables test cleanup

### Attack Prevention

- **Brute Force**: Limited to 10 login attempts per minute per IP
- **Credential Stuffing**: Limited to 5 signup attempts per minute per IP
- **Instance Hopping**: Shared state prevents bypass across instances
- **Race Conditions**: Atomic Redis operations prevent counter corruption
- **Cold Start Bypass**: Persistent storage survives serverless restarts

## Environment Configuration

### Required Production Variables

```env
# Distributed rate limiting storage
KV_REST_API_URL=https://your-kv-store.redis.com
KV_REST_API_TOKEN=your-secure-token

# Persistent authentication storage
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Development/Testing

No additional configuration required. The system automatically falls back to in-memory storage when:
- `NODE_ENV` is not "production"
- KV_REST_API_URL or KV_REST_API_TOKEN are not set

### Vercel KV Provisioning

```bash
# Create KV store
vercel kv create eventra-rate-limit

# Add environment variables
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

## Rate Limits

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| Login | 10 requests | 1 minute | IP address |
| Signup | 5 requests | 1 minute | IP address |

## Implementation Details

### Atomic Increment with Expiration

```javascript
// Redis pipeline ensures atomicity
const pipeline = redis.pipeline();
pipeline.incr(key);
pipeline.pexpire(key, windowMs);
const results = await pipeline.exec();
```

This prevents race conditions where multiple instances check the limit simultaneously.

### Fail-Closed Logic

```javascript
if (process.env.NODE_ENV === "production" && !isDistributedRateLimitStorageConfigured()) {
  throw new Error(
    "KV_REST_API_URL and KV_REST_API_TOKEN are required in production for distributed rate limiting."
  );
}
```

### Async Rate Limiting

The rate limiter check is now async to support distributed storage:

```javascript
// Before (synchronous)
if (!limiter.check(key).allowed) {
  // handle rate limit
}

// After (asynchronous)
const result = await limiter.check(key);
if (!result.allowed) {
  // handle rate limit
}
```

## Testing

### Unit Tests

- `src/__tests__/rate-limit-config.test.js`: Configuration validation
- `src/__tests__/rate-limit-storage.test.js`: Storage layer operations
- `src/__tests__/rateLimiter.test.js`: Rate limiter logic

### Integration Tests

- `src/__tests__/auth-rate-limit-integration.test.js`: Authentication endpoint integration

### Test Coverage

- Allowed requests under threshold
- Blocked requests over threshold
- Window expiration behavior
- Distributed/shared-state behavior
- Storage failures
- Concurrent requests
- Authentication endpoint integration

## Migration Guide

### For Existing Code

The API surface is backward compatible. Existing code using `createRateLimiter` and `enforceRateLimit` requires minimal changes:

1. **Make check() calls async**: Add `await` before `limiter.check(key)`
2. **Configure environment variables**: Set KV_REST_API_URL and KV_REST_API_TOKEN in production
3. **Test locally**: Verify rate limiting works in development (uses in-memory storage)

### Example Migration

```javascript
// Before
if (!loginRateLimiter.check(clientIp).allowed) {
  return res.status(429).json({ error: "Too many requests" });
}

// After
const rateLimitResult = await loginRateLimiter.check(clientIp);
if (!rateLimitResult.allowed) {
  return res.status(429).json({ error: "Too many requests" });
}
```

## Performance Considerations

### Redis Latency

- Redis operations are typically < 1ms in the same region
- Pipeline operations reduce round-trips
- Connection pooling via ioredis client singleton

### Cold Start Impact

- Redis client is lazy-initialized on first use
- Connection establishment adds ~10-20ms on cold start
- Subsequent requests use existing connection

### Memory Usage

- In-memory fallback: O(n) where n is number of active rate-limit keys
- Redis storage: Automatic expiration prevents unbounded growth
- No memory leaks due to TTL-based cleanup

## Monitoring and Observability

### Error Logging

- Redis connection errors logged with context
- Storage unavailability warnings in development
- Production failures logged as errors

### Metrics to Track

- Rate-limit rejection rate (429 responses)
- Redis operation latency
- Storage availability percentage
- Concurrent request handling

## Troubleshooting

### Production: Rate Limiting Rejects All Requests

**Symptom**: All authentication requests return 429

**Cause**: Distributed storage not configured or unavailable

**Solution**:
1. Verify KV_REST_API_URL and KV_REST_API_TOKEN are set
2. Check Redis/KV store is accessible
3. Review logs for connection errors

### Development: Rate Limiting Not Working

**Symptom**: Rate limits not enforced in development

**Cause**: Expected behavior - in-memory storage used

**Solution**: This is intentional for development convenience. Test with production configuration to verify distributed behavior.

### Redis Connection Errors

**Symptom**: Logs show Redis connection failures

**Cause**: Network issues, invalid credentials, or KV store downtime

**Solution**:
1. Verify KV_REST_API_URL is correct
2. Check KV_REST_API_TOKEN is valid
3. Ensure network connectivity to Redis/KV store
4. Review KV store status page

## Future Enhancements

Potential improvements for future iterations:

1. **Sliding Window**: Implement sliding window rate limiting for more accurate throttling
2. **Per-User Limits**: Add user-specific rate limits in addition to IP-based limits
3. **Dynamic Limits**: Adjust limits based on traffic patterns and threat detection
4. **Metrics Export**: Export Prometheus metrics for rate-limit statistics
5. **Distributed Locking**: Add distributed locking for advanced use cases

## References

- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [Redis INCR Documentation](https://redis.io/commands/incr/)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#rate-limiting)
