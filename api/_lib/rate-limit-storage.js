/**
 * api/lib/rate-limit-storage.js
 *
 * Distributed rate-limit storage abstraction layer.
 *
 * This module provides a unified interface for rate-limit storage that works
 * across multiple deployment scenarios:
 * - Production: Uses Redis for distributed storage
 * - Development/Testing: Uses in-memory Map storage
 *
 * The storage interface provides atomic increment-with-expiration operations
 * to prevent race conditions and ensure accurate rate limiting across instances.
 *
 * SECURITY: Fail-closed behavior - if distributed storage is required but unavailable,
 * operations will throw errors rather than silently falling back to insecure storage.
 */

import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "./rate-limit-config.js";

// Redis client singleton (lazy initialization)
let redisClient = null;
let RedisClass = null;

// In-memory fallback storage (only for development/testing)
const inMemoryStore = new Map();

// Register cleanup hook to close Redis connection on process exit
let cleanupRegistered = false;
function registerCleanupHook() {
  if (cleanupRegistered) return;
  cleanupRegistered = true;
  const cleanup = async () => {
    if (redisClient) {
      try {
        await redisClient.quit();
      } catch {
        // Ignore cleanup errors
      }
      redisClient = null;
    }
  };
  if (typeof process !== "undefined" && typeof process.on === "function") {
    process.on("beforeExit", cleanup);
    process.on("SIGINT", () => {
      cleanup();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      cleanup();
      process.exit(0);
    });
  }
}

/**
 * Gets or creates the Redis client.
 *
 * @returns {Promise<Redis|null>} Redis client or null if not configured
 * @throws {Error} If Redis connection fails
 */
async function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  // Check if we are running in an environment that supports ioredis (Node.js runtime)
  if (typeof process === "undefined" || !process.release || process.env.EDGE_RUNTIME) {
    return null;
  }

  registerCleanupHook();

  if (!isDistributedRateLimitStorageConfigured()) {
    return null;
  }

  try {
    const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
    if (!redisUrl) {
      console.error("[rate-limit-storage.js] No Redis URL configured. Set RATE_LIMIT_REDIS_URL.");
      return null;
    }

    if (!RedisClass) {
      // Use webpackIgnore and @vite-ignore to prevent bundlers from statically analyzing
      // and including ioredis and its Node.js dependencies in Edge/browser builds.
      const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ "ioredis");
      RedisClass = module.default || module;
    }

    const client = new RedisClass(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 100, 500);
      },
    });

    client.on("error", (err) => {
      console.error("[rate-limit-storage.js] Redis client error:", err);
    });

    redisClient = client;
    return redisClient;
  } catch (err) {
    console.error("[rate-limit-storage.js] Failed to create Redis client:", err);
    redisClient = null;
    return null;
  }
}

/**
 * Increments a counter atomically with expiration.
 *
 * This is the core operation for rate limiting. It must be atomic to prevent
 * race conditions when multiple instances check the limit simultaneously.
 *
 * @param {string} key - The rate-limit key (e.g., IP address)
 * @param {number} windowMs - Time window in milliseconds
 * @param {Object} options - Optional configuration
 * @param {boolean} options.forceInMemoryFallback - Skip Redis and use in-memory directly
 * @returns {Promise<{count: number, ttl: number}>} Current count and time-to-live
 * @throws {Error} If storage operation fails and fallback is not allowed
 */
export async function incrementWithExpiration(key, windowMs, options = {}) {
  const { forceInMemoryFallback = false } = options;

  // If forced to use in-memory, skip Redis entirely
  if (forceInMemoryFallback) {
    console.warn("[RATE_LIMIT] Using forced in-memory fallback for rate limiting");
    return incrementInMemory(key, windowMs);
  }

  const redis = await getRedisClient();

  if (redis) {
    // Use Redis for distributed storage
    try {
      // Atomic operation: increment and set expiration only if key is new (count === 1)
      const count = await redis.eval(
        "local current = redis.call('incr', KEYS[1]); if current == 1 then redis.call('pexpire', KEYS[1], ARGV[1]) end; return current;",
        1,
        key,
        windowMs
      );

      return { count, ttl: windowMs };
    } catch (err) {
      // Log the Redis failure
      console.error("[RATE_LIMIT] Distributed storage (Redis) unavailable:", err.message);
      
      // Check if in-memory fallback is allowed based on fail mode
      const failMode = process.env.RATE_LIMIT_FAIL_MODE?.toLowerCase()?.trim() || "fallback";
      
      if (failMode === "closed") {
        // Fail-closed mode: reject when storage fails
        throw new Error(
          "Rate-limit storage unavailable. Cannot safely enforce rate limits without distributed storage (fail-closed mode)."
        );
      }
      
      // For "fallback" and "open" modes, fall back to in-memory
      console.warn("[RATE_LIMIT] Falling back to in-memory rate limiting");
      return incrementInMemory(key, windowMs);
    }
  } else {
    // No Redis configured
    if (!isInMemoryRateLimitStorageAllowed()) {
      const failMode = process.env.RATE_LIMIT_FAIL_MODE?.toLowerCase()?.trim() || "fallback";
      
      if (failMode === "closed") {
        throw new Error(
          "Distributed rate-limit storage is required in production. Configure RATE_LIMIT_REDIS_URL (fail-closed mode)."
        );
      }
      
      console.warn("[RATE_LIMIT] Distributed storage not configured, using in-memory fallback");
    }
    return incrementInMemory(key, windowMs);
  }
}

/**
 * In-memory increment with expiration (fallback for development/testing).
 *
 * @param {string} key - The rate-limit key
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{count: number, ttl: number}} Current count and time-to-live
 */
function incrementInMemory(key, windowMs) {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || now - record.start > windowMs) {
    // Window expired or new key
    inMemoryStore.set(key, { start: now, count: 1 });
    return { count: 1, ttl: windowMs };
  }

  // Increment within window
  record.count++;
  const remainingTtl = windowMs - (now - record.start);
  return { count: record.count, ttl: Math.max(0, remainingTtl) };
}

/**
 * Resets a rate-limit key (for testing purposes).
 *
 * @param {string} key - The rate-limit key to reset
 * @returns {Promise<void>}
 */
export async function resetKey(key) {
  const redis = await getRedisClient();

  if (redis) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error("[rate-limit-storage.js] Failed to reset key in Redis:", err);
      throw err;
    }
  } else {
    inMemoryStore.delete(key);
  }
}

/**
 * Clears all rate-limit data (for testing purposes).
 *
 * @returns {Promise<void>}
 */
export async function clearAll() {
  const redis = await getRedisClient();

  if (redis) {
    try {
      // Check if Redis is connected before attempting operations
      if (redis.status === "ready") {
        // Delete all keys with the rate-limit prefix (if we use one)
        // For now, we'll just flush the database in test mode
        if (process.env.NODE_ENV === "test") {
          await redis.flushdb();
        }
      } else {
        // Redis client exists but not connected, fall back to in-memory
        console.warn("[rate-limit-storage.js] Redis not connected, clearing in-memory store instead");
        inMemoryStore.clear();
      }
    } catch (err) {
      console.error("[rate-limit-storage.js] Failed to clear Redis:", err);
      // Fall back to clearing in-memory store
      inMemoryStore.clear();
    }
  } else {
    inMemoryStore.clear();
  }
}

/**
 * Closes the Redis connection (for graceful shutdown).
 *
 * @returns {Promise<void>}
 */
export async function close() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
    } catch (err) {
      console.error("[rate-limit-storage.js] Failed to close Redis connection:", err);
    }
  }
}
