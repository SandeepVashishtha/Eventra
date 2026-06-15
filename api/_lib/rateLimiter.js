import { incrementWithExpiration, close } from "./rate-limit-storage.js";
import { isDistributedRateLimitStorageConfigured } from "./rate-limit-config.js";

const NODE_ENV = process.env.NODE_ENV || 'development';

const USE_MEMORY = NODE_ENV !== 'production' || process.env.RATE_LIMIT_MODE === 'memory';

class InMemoryRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
  }

  check(key) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now - record.start > this.windowMs) {
      this.store.set(key, { start: now, count: 1 });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }

    record.count++;
    return {
      allowed: record.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - record.count),
      resetAt: record.start + this.windowMs,
    };
  }

  async checkAsync(key) {
    return this.check(key);
  }
}

class DistributedRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async checkAsync(key) {
    const windowStart = Math.floor(Date.now() / this.windowMs) * this.windowMs;
    const storageKey = `ratelimit:${key}:${windowStart}`;

    try {
      const { count } = await incrementWithExpiration(storageKey, this.windowMs);
      return {
        allowed: count <= this.maxRequests,
        remaining: Math.max(0, this.maxRequests - count),
        resetAt: windowStart + this.windowMs,
      };
    } catch (error) {
      console.error("[rateLimiter] Distributed check failed:", error.message);
      throw new Error(`Rate limit check failed: ${error.message}`);
    }
  }

  check(key) {
    throw new Error("Synchronous check not supported for distributed rate limiter. Use await checkAsync(key) instead.");
  }
}

function createFailClosedLimiter(message) {
  return {
    check() { throw new Error(message); },
    async checkAsync() { throw new Error(message); },
  };
}

export const createRateLimiter = (windowMs, maxRequests) => {
  if (NODE_ENV === 'production') {
    if (isDistributedRateLimitStorageConfigured()) {
      return new DistributedRateLimiter(windowMs, maxRequests);
    }
    console.error("[rateLimiter] CRITICAL: Production requires distributed storage. Set KV_REST_API_URL or RATE_LIMIT_REDIS_URL.");
    return createFailClosedLimiter("Rate limiting is not configured for production.");
  }

  if (USE_MEMORY || !isDistributedRateLimitStorageConfigured()) {
    console.warn("[rateLimiter] Using in-memory storage (not suitable for production)");
    return new InMemoryRateLimiter(windowMs, maxRequests);
  }

  return new DistributedRateLimiter(windowMs, maxRequests);
};

export const loginRateLimiter = createRateLimiter(60_000, 10);
export const signupRateLimiter = createRateLimiter(60_000, 5);
export const registerRateLimiter = createRateLimiter(60_000, 20);
export const icsRateLimiter = createRateLimiter(60_000, 60);

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

export function validateRateLimitConfig() {
  if (NODE_ENV !== 'production') return true;

  const errors = [];
  if (!isDistributedRateLimitStorageConfigured()) {
    errors.push("Production requires distributed rate limiting. Set KV_REST_API_URL/KV_REST_API_TOKEN or RATE_LIMIT_REDIS_URL.");
  }
  if (process.env.RATE_LIMIT_MODE === 'memory') {
    errors.push("RATE_LIMIT_MODE=memory is not allowed in production.");
  }
  if (errors.length > 0) {
    console.error("[rateLimiter] Configuration errors:", errors.join("; "));
    throw new Error(`Rate limiting configuration error: ${errors.join("; ")}`);
  }
  console.log("[rateLimiter] Configuration validated successfully");
  return true;
}

export { close as closeRateLimitStorage };
