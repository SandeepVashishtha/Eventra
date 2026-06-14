/**
 * api/lib/rateLimiter.js
 *
 * Distributed rate-limiting implementation for authentication endpoints.
 *
 * This module provides rate limiting that works correctly across multiple
 * serverless instances and horizontally scaled deployments. It uses distributed
 * storage (Redis/Vercel KV) to maintain shared rate-limit state, preventing
 * attackers from bypassing throttling by distributing requests across instances.
 *
 * SECURITY: Fail-closed behavior - if distributed storage is required but unavailable,
 * rate limiting will reject requests rather than silently allowing unlimited access.
 *
 * Architecture:
 * - Storage abstraction: rate-limit-storage.js (Redis + in-memory fallback for dev/test)
 * - Configuration validation: rate-limit-config.js (enforces production requirements)
 * - Atomic operations: Uses Redis INCR with EXPIRE to prevent race conditions
 */

import { incrementWithExpiration } from "./rate-limit-storage.js";
import { assertDistributedRateLimitStorageConfigured } from "./rate-limit-config.js";

// Fail-fast: Assert distributed storage is configured in production
assertDistributedRateLimitStorageConfigured();

/**
 * Creates a distributed rate limiter.
 *
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests allowed within the window
 * @returns {Object} Rate limiter with check method
 */
export const createRateLimiter = (windowMs, maxRequests) => {
  const check = async (key) => {
    try {
      const { count, ttl } = await incrementWithExpiration(key, windowMs);
      const allowed = count <= maxRequests;
      return { allowed, count, remaining: Math.max(0, maxRequests - count), resetAfter: ttl };
    } catch (err) {
      // In production, fail closed - reject requests if storage is unavailable
      if (process.env.NODE_ENV === "production") {
        console.error("[rateLimiter.js] Rate-limit storage unavailable:", err);
        // Return not allowed to prevent unlimited requests
        return { allowed: false, error: "Rate-limit storage unavailable" };
      }
      // In development/test, allow requests but log the error
      console.warn("[rateLimiter.js] Rate-limit storage unavailable in development:", err.message);
      return { allowed: true, error: "Rate-limit storage unavailable (dev mode)" };
    }
  };
  return { check };
};

/**
 * Login rate limiter: 10 requests per minute per IP.
 */
export const loginRateLimiter = createRateLimiter(60_000, 10);

/**
 * Enforces rate limit for a given key.
 *
 * @param {Object} limiter - Rate limiter instance
 * @param {string} key - Rate-limit key (e.g., IP address)
 * @throws {Error} If rate limit is exceeded
 */
export const enforceRateLimit = async (limiter, key) => {
  const result = await limiter.check(key);
  if (!result.allowed) {
    const err = new Error("Too many requests. Please try again later.");
    err.status = 429;
    throw err;
  }
};
