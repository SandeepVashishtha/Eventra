/**
 * Distributed Rate Limiter
 * 
 * Provides production-ready rate limiting using distributed storage (Redis/KV)
 * with fallback to in-memory storage for development/testing.
 * 
 * Security: Fail-closed in production - rejects requests if distributed storage
 * is required but unavailable.
 * 
 * Supported backends:
 * - Vercel KV (REST API)
 * - Upstash Redis (ioredis)
 * - Standard Redis (ioredis)
 * - In-memory (development/test only)
 */

// Environment detection
const NODE_ENV = process.env.NODE_ENV || 'development';
const RATE_LIMIT_MODE = process.env.RATE_LIMIT_MODE || (NODE_ENV === 'production' ? 'distributed' : 'memory');

// Redis/KV configuration
const REDIS_URL = process.env.RATE_LIMIT_REDIS_URL;
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

// Determine which backend to use
const USE_KV_REST = KV_REST_API_URL && KV_REST_API_TOKEN;
const USE_REDIS = REDIS_URL && !USE_KV_REST;
// CRITICAL: Memory mode is NOT allowed in production
const USE_MEMORY = (RATE_LIMIT_MODE === 'memory' || NODE_ENV === 'test') && NODE_ENV !== 'production';

// Redis client (lazy initialization)
let redisClient = null;

/**
 * Initialize Redis connection if needed
 */
async function getRedisClient() {
  if (redisClient) return redisClient;
  
  if (!USE_REDIS) {
    throw new Error('Redis is not configured');
  }

  try {
    const Redis = await import('ioredis');
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 50, 200);
      },
    });

    // Test connection
    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error('[rateLimiter] Redis connection failed:', error.message);
    throw new Error(`Redis connection failed: ${error.message}`);
  }
}

/**
 * In-memory rate limiter for development/testing
 * WARNING: Not suitable for production - resets on restart
 */
class InMemoryRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.store = new Map();
  }

  // Synchronous check for backwards compatibility
  check(key) {
    const now = Date.now();
    const record = this.store.get(key);
    
    if (!record || now - record.start > this.windowMs) {
      this.store.set(key, { start: now, count: 1 });
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs };
    }
    
    record.count++;
    const allowed = record.count <= this.maxRequests;
    return {
      allowed,
      remaining: Math.max(0, this.maxRequests - record.count),
      resetAt: record.start + this.windowMs,
    };
  }

  // Async check for consistency with distributed backends
  async checkAsync(key) {
    return this.check(key);
  }
}

/**
 * Upstash Redis REST API rate limiter
 * Uses fetch-based REST API for edge compatibility
 * Note: Vercel KV was migrated to Upstash Redis in December 2024
 */
class KvRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.kvUrl = KV_REST_API_URL;
    this.kvToken = KV_REST_API_TOKEN;
  }

  async check(key) {
    const windowStart = Math.floor(Date.now() / this.windowMs) * this.windowMs;
    const redisKey = `ratelimit:${key}:${windowStart}`;
    const headers = {
      Authorization: `Bearer ${this.kvToken}`,
    };

    try {
      // Atomic increment using Upstash Redis REST API
      // Format: REST_URL/incr/key
      const incrRes = await fetch(`${this.kvUrl}/incr/${encodeURIComponent(redisKey)}`, {
        method: 'POST',
        headers,
      });

      if (!incrRes.ok) {
        throw new Error(`KV INCR failed: ${incrRes.status}`);
      }

      const { result: count } = await incrRes.json();

      // Set expiry on first request using EXPIRE command
      // Format: REST_URL/expire/key/seconds
      if (count === 1) {
        const expirySeconds = Math.floor(this.windowMs / 1000);
        fetch(`${this.kvUrl}/expire/${encodeURIComponent(redisKey)}/${expirySeconds}`, {
          method: 'POST',
          headers,
        }).catch((err) => {
          console.warn('[rateLimiter] Failed to set expiry:', err.message);
        });
      }

      const allowed = count <= this.maxRequests;
      return {
        allowed,
        remaining: Math.max(0, this.maxRequests - count),
        resetAt: windowStart + this.windowMs,
      };
    } catch (error) {
      console.error('[rateLimiter] KV check failed:', error.message);
      throw new Error(`KV rate limit check failed: ${error.message}`);
    }
  }

  // Synchronous check not supported for distributed backends
  check(key) {
    throw new Error('Synchronous check not supported for distributed rate limiter. Use await check(key) instead.');
  }
}

/**
 * Redis (ioredis) rate limiter
 * Uses atomic INCR with Lua script for atomic increment + expiry
 */
class RedisRateLimiter {
  constructor(windowMs, maxRequests) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.redisUrl = REDIS_URL;
  }

  async check(key) {
    const windowStart = Math.floor(Date.now() / this.windowMs) * this.windowMs;
    const redisKey = `ratelimit:${key}:${windowStart}`;
    const expirySeconds = Math.floor(this.windowMs / 1000);

    try {
      const client = await getRedisClient();

      // Use Lua script for atomic INCR + EXPIRE
      const luaScript = `
        local current = redis.call('INCR', KEYS[1])
        if current == 1 then
          redis.call('EXPIRE', KEYS[1], ARGV[1])
        end
        return current
      `;

      const count = await client.eval(luaScript, 1, redisKey, expirySeconds);

      const allowed = count <= this.maxRequests;
      return {
        allowed,
        remaining: Math.max(0, this.maxRequests - count),
        resetAt: windowStart + this.windowMs,
      };
    } catch (error) {
      console.error('[rateLimiter] Redis check failed:', error.message);
      throw new Error(`Redis rate limit check failed: ${error.message}`);
    }
  }

  // Synchronous check not supported for distributed backends
  check(key) {
    throw new Error('Synchronous check not supported for distributed rate limiter. Use await check(key) instead.');
  }
}

/**
 * Create a rate limiter instance
 * 
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum requests per window
 * @returns {Object} Rate limiter with check() method (sync for memory, async for distributed)
 */
export const createRateLimiter = (windowMs, maxRequests) => {
  // Validate configuration in production
  if (NODE_ENV === 'production') {
    if (!USE_KV_REST && !USE_REDIS) {
      console.error(
        '[rateLimiter] CRITICAL: Production requires distributed storage. ' +
        'Set RATE_LIMIT_REDIS_URL or KV_REST_API_URL/KV_REST_API_TOKEN. ' +
        'RATE_LIMIT_MODE=memory is not allowed in production.'
      );
    }
  }

  // Select backend
  if (USE_MEMORY) {
    if (NODE_ENV === 'production') {
      console.error('[rateLimiter] ERROR: RATE_LIMIT_MODE=memory is not allowed in production');
      // Fail closed in production
      return {
        check(key) {
          throw new Error('Rate limiting is not configured for production. Set RATE_LIMIT_REDIS_URL or KV_REST_API_URL/KV_REST_API_TOKEN.');
        },
      };
    }
    console.warn('[rateLimiter] Using in-memory storage (not suitable for production)');
    return new InMemoryRateLimiter(windowMs, maxRequests);
  }

  if (USE_KV_REST) {
    return new KvRateLimiter(windowMs, maxRequests);
  }

  if (USE_REDIS) {
    return new RedisRateLimiter(windowMs, maxRequests);
  }

  // Fallback for development without configuration
  if (NODE_ENV === 'development') {
    console.warn('[rateLimiter] No distributed storage configured, using in-memory fallback');
    return new InMemoryRateLimiter(windowMs, maxRequests);
  }

  // Production without configuration - fail closed
  return {
    check(key) {
      throw new Error(
        'Rate limiting is not configured. ' +
        'Set RATE_LIMIT_REDIS_URL or KV_REST_API_URL/KV_REST_API_TOKEN in production.'
      );
    },
  };
};

// Pre-configured limiters
export const loginRateLimiter = createRateLimiter(60_000, 10);
export const signupRateLimiter = createRateLimiter(60_000, 5);

/**
 * Enforce rate limit and throw error if exceeded
 * 
 * @param {Object} limiter - Rate limiter instance
 * @param {string} key - Identifier (typically IP address)
 * @throws {Error} With status 429 if rate limit exceeded
 */
export const enforceRateLimit = async (limiter, key) => {
  const result = await limiter.check(key);
  if (!result.allowed) {
    const err = new Error("Too many requests. Please try again later.");
    err.status = 429;
    err.remaining = result.remaining;
    err.resetAt = result.resetAt;
    throw err;
  }
  return result;
};

/**
 * Validate rate limiting configuration at startup
 * Call this during application initialization to fail fast if misconfigured
 */
export function validateRateLimitConfig() {
  const errors = [];

  if (NODE_ENV === 'production') {
    // CRITICAL: Production MUST have distributed storage
    if (!USE_KV_REST && !USE_REDIS) {
      errors.push(
        'Production requires distributed rate limiting. ' +
        'Set RATE_LIMIT_REDIS_URL or KV_REST_API_URL/KV_REST_API_TOKEN. ' +
        'RATE_LIMIT_MODE=memory is not allowed in production.'
      );
    }

    if (USE_KV_REST && !KV_REST_API_TOKEN) {
      errors.push('KV_REST_API_URL is set but KV_REST_API_TOKEN is missing.');
    }

    if (USE_REDIS && !REDIS_URL) {
      errors.push('RATE_LIMIT_MODE implies Redis but RATE_LIMIT_REDIS_URL is not set.');
    }

    // CRITICAL: Reject RATE_LIMIT_MODE=memory in production
    if (RATE_LIMIT_MODE === 'memory') {
      errors.push('RATE_LIMIT_MODE=memory is not allowed in production. Remove this setting or use distributed storage.');
    }
  }

  if (errors.length > 0) {
    console.error('[rateLimiter] Configuration errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
    throw new Error(`Rate limiting configuration error: ${errors.join('; ')}`);
  }

  console.log('[rateLimiter] Configuration validated successfully');
  return true;
}
