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

import Redis from "ioredis";
import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "./rate-limit-config.js";

// Redis client singleton (lazy initialization)
let redisClient = null;

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
  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

/**
 * Gets or creates the Redis client.
 *
 * @returns {Redis|null} Redis client or null if not configured
 * @throws {Error} If Redis connection fails
 */
function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
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

    const client = new Redis(redisUrl, {
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
 * @returns {Promise<{count: number, ttl: number}>} Current count and time-to-live
 * @throws {Error} If storage operation fails in production
 */
export async function incrementWithExpiration(key, windowMs) {
  const redis = getRedisClient();

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
      // In production, fail closed - do not silently fall back
      if (process.env.NODE_ENV === "production") {
        console.error("[rate-limit-storage.js] Redis operation failed in production:", err);
        throw new Error(
          "Rate-limit storage unavailable. Cannot safely enforce rate limits without distributed storage."
        );
      }
      // In development/test, fall back to in-memory storage
      console.warn("[rate-limit-storage.js] Redis unavailable, falling back to in-memory storage:", err.message);
      return incrementInMemory(key, windowMs);
    }
  } else {
    // No Redis configured
    if (!isInMemoryRateLimitStorageAllowed()) {
      throw new Error(
        "Distributed rate-limit storage is required in production. Configure RATE_LIMIT_REDIS_URL."
      );
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
  const redis = getRedisClient();

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
  const redis = getRedisClient();

  if (redis) {
    try {
      // Delete all keys with the rate-limit prefix (if we use one)
      // For now, we'll just flush the database in test mode
      if (process.env.NODE_ENV === "test") {
        await redis.flushdb();
      }
    } catch (err) {
      console.error("[rate-limit-storage.js] Failed to clear Redis:", err);
      throw err;
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
