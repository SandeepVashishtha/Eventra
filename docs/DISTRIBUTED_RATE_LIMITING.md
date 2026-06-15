# Distributed Rate Limiting Architecture

This document describes the design and implementation of the rate limiting system in the Eventra backend (`api/_lib/rateLimiter.js`). The system supports multiple storage backends, handles production environments with strict security fail-closed guarantees, and prevents credential-stuffing and abuse.

## Problem Statement: Class Method Overwrite in DistributedRateLimiter

In the previous implementation, the `DistributedRateLimiter` class had a method overwrite defect:
```javascript
class DistributedRateLimiter {
  async check(key) {
    // distributed async check logic
  }

  check(key) {
    throw new Error("Synchronous check not supported...");
  }
}
```
In JavaScript class definitions, redeclaring a method name on the prototype overwrites the previous definition. Since the synchronous `check` method was declared second, it completely overwrote the asynchronous `async check` method.
As a result:
- Any call to `limiter.check(key)`, whether awaited or not, always invoked the synchronous version.
- The synchronous version unconditionally threw a `Synchronous check not supported` error.
- In production, this resulted in uncaught exceptions and `500 Internal Server Error` failures on crucial routes such as `/api/auth/login` and `/api/auth/signup`, blocking user authentication.

## Architecture & Design: Async/Sync Dispatch Separator

To fix this method overwrite while preserving synchronous call warnings, we renamed the asynchronous method to `checkAsync`:

### 1. Interface Consistency
Both `InMemoryRateLimiter` and `DistributedRateLimiter` now export two distinct methods:
- `check(key)`: The synchronous execution path.
  - **InMemory**: Checks rate limits synchronously against an in-memory Map (ideal for local/development/testing).
  - **Distributed**: Synchronously throws an error warning that distributed operations must be asynchronous.
- `checkAsync(key)`: The asynchronous execution path.
  - **InMemory**: Wraps the synchronous check in a resolved Promise.
  - **Distributed**: Performs asynchronous increments and expiration checks against the distributed store (Redis or Vercel KV).

### 2. Unified Dispatch Helper (`enforceRateLimit`)
The `enforceRateLimit` helper is designed as a unified async coordinator:
```javascript
export const enforceRateLimit = async (limiter, key) => {
  const result = await limiter.checkAsync(key);
  if (!result.allowed) {
    const err = new Error("Too many requests. Please try again later.");
    err.status = 429;
    err.remaining = result.remaining;
    err.resetAt = result.resetAt;
    throw err;
  }
  return result;
};
```
Because all limiters (including fail-closed limiters) implement `checkAsync`, `enforceRateLimit` safely delegates to the asynchronous path in both production and development environments.

## Fail-Closed Principles in Production

For security-critical endpoints (such as `/api/auth/login` and `/api/auth/signup`), Eventra implements a **fail-closed** policy in production:
- If no distributed storage URL (Vercel KV or Redis) is configured during startup in `production`, `createRateLimiter` returns a fallback fail-closed limiter (`createFailClosedLimiter`).
- This fail-closed limiter throws an error on both `check` and `checkAsync` calls.
- The calling endpoint catches the error and blocks access with a `500 Rate limiting service unavailable` error.
- This prevents brute-force attempts from bypassing authentication filters if the rate-limiting infrastructure goes offline.
