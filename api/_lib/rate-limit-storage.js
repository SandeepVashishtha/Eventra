/**
 * api/lib/rate-limit-storage.js
 *
 * @module RateLimitStorage
 * @description Distributed rate-limit storage abstraction layer.
 * This module is a CRITICAL security defence layer protecting Eventra API routes
 * from brute-force and Denial-of-Service (DoS) attacks.
 *
 * SECURITY LEVEL: CRITICAL
 * Quality standard: EXCEPTIONAL
 *
 * This module provides a unified interface for rate-limit storage that works
 * across multiple deployment scenarios:
 * - Production: Uses Redis/Vercel KV for distributed storage
 * - Development/Testing: Uses in-memory Map storage
 *
 * The storage interface provides atomic increment-with-expiration operations
 * to prevent race conditions and ensure accurate rate limiting across serverless instances.
 *
 * SAFETY PRINCIPLES:
 * 1. Fail Closed: If distributed storage is required but unavailable in production,
 *    operations will throw errors rather than silently falling back to insecure storage.
 * 2. Fixed-Window Lockout Prevention: Uses a dynamic TTL check before setting expiry
 *    to prevent the sliding-window mismatch lockout bug.
 */

import Redis from "ioredis";
import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "./rate-limit-config.js";

/** @type {Redis|null} */
let redisClient = null;

/** @type {Map<string, {start: number, count: number}>} */
const inMemoryStore = new Map();

/** @type {boolean} */
let cleanupRegistered = false;

/**
 * Registers process signal listeners to gracefully close connection pool.
 * @private
 */
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
 * Gets or creates the Redis client singleton.
 *
 * @security Fail Closed behavior on configuration checks.
 * @returns {Redis|null} Redis client or null if not configured
 * @throws {Error} If Redis configuration is invalid or connection fails
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
    const redisUrl = process.env.RATE_LIMIT_REDIS_URL || process.env.KV_REST_API_URL;
    if (!redisUrl) {
      console.error("[rate-limit-storage.js] No Redis URL configured. Set RATE_LIMIT_REDIS_URL or KV_REST_API_URL.");
      return null;
    }

    if (redisUrl.startsWith("https://") || redisUrl.startsWith("http://")) {
      console.error("[rate-limit-storage.js] KV_REST_API_URL is an HTTP REST endpoint, not a Redis connection URL. Set RATE_LIMIT_REDIS_URL for direct Redis connections.");
      return null;
    }

    const client = new Redis(redisUrl, {
      password: process.env.KV_REST_API_TOKEN,
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
 * This is the core operation for rate limiting. It is atomic to prevent
 * race conditions when multiple serverless instances check the limit simultaneously.
 *
 * @security Fixed-Window Lockout Prevention. Checks key TTL before modifying expiry.
 * @async
 * @param {string} key - The rate-limit key (e.g., IP address + endpoint identifier)
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{count: number, ttl: number}>} Current request count and remaining time-to-live
 * @throws {Error} If storage operation fails in production (Fail Closed)
 */
/**
 * Validates parameters for the rate-limiting increment operations.
 *
 * @private
 * @param {string} key - The rate-limit key
 * @param {number} windowMs - Time window in milliseconds
 * @throws {Error} If parameters are invalid
 */
function validateParams(key, windowMs) {
  if (!key) {
    throw new Error("Invalid parameters: key is required");
  }
  if (typeof key !== "string") {
    throw new Error("Invalid parameters: key must be a string");
  }
  if (typeof windowMs !== "number") {
    throw new Error("Invalid parameters: windowMs must be a number");
  }
  if (windowMs <= 0) {
    throw new Error("Invalid parameters: windowMs must be positive");
  }
  if (!Number.isInteger(windowMs)) {
    throw new Error("Invalid parameters: windowMs must be an integer");
  }
}

/**
 * Performs atomic increment and fetches key TTL in a Redis pipeline.
 *
 * @private
 * @param {Redis} redis - Redis client instance
 * @param {string} key - The rate-limit key
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{count: number, ttl: number}>}
 */
async function executeRedisPipeline(redis, key, windowMs) {
  const pipeline = redis.pipeline();
  pipeline.incr(key);
  pipeline.pttl(key);
  const results = await pipeline.exec();

  if (!results) {
    throw new Error("Redis pipeline returned no results");
  }

  const [incrErr, count] = results[0];
  const [pttlErr, ttl] = results[1];

  if (incrErr) {
    throw incrErr;
  }
  if (pttlErr) {
    console.error("[rate-limit-storage.js] Failed to get TTL from Redis:", pttlErr);
  }

  if (ttl === -1) {
    try {
      await redis.pexpire(key, windowMs);
    } catch (expireErr) {
      console.error("[rate-limit-storage.js] Failed to set expiration:", expireErr);
    }
  }

  return { count, ttl: ttl === -1 ? windowMs : ttl };
}

/**
 * Runs the Redis operation with production fail-closed and development/test fallback.
 *
 * @private
 * @param {Redis} redis - Redis client instance
 * @param {string} key - The rate-limit key
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{count: number, ttl: number}>}
 */
async function runRedisWithFallback(redis, key, windowMs) {
  try {
    return await executeRedisPipeline(redis, key, windowMs);
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      console.error("[rate-limit-storage.js] Redis operation failed in production:", err);
      throw new Error(
        "Rate-limit storage unavailable. Cannot safely enforce rate limits without distributed storage."
      );
    }
    console.warn("[rate-limit-storage.js] Redis unavailable, falling back to in-memory storage:", err.message);
    return incrementInMemory(key, windowMs);
  }
}

/**
 * Increments a counter atomically with expiration.
 *
 * This is the core operation for rate limiting. It is atomic to prevent
 * race conditions when multiple serverless instances check the limit simultaneously.
 *
 * @security Fixed-Window Lockout Prevention. Checks key TTL before modifying expiry.
 * @async
 * @param {string} key - The rate-limit key (e.g., IP address + endpoint identifier)
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{count: number, ttl: number}>} Current request count and remaining time-to-live
 * @throws {Error} If storage operation fails in production (Fail Closed)
 */
export async function incrementWithExpiration(key, windowMs) {
  validateParams(key, windowMs);

  const redis = getRedisClient();
  if (redis) {
    return runRedisWithFallback(redis, key, windowMs);
  }

  if (!isInMemoryRateLimitStorageAllowed()) {
    throw new Error(
      "Distributed rate-limit storage is required in production. Configure KV_REST_API_URL and KV_REST_API_TOKEN."
    );
  }

  return incrementInMemory(key, windowMs);
}

/**
 * In-memory increment with expiration (fallback for development/testing).
 *
 * @private
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
 * @async
 * @param {string} key - The rate-limit key to reset
 * @returns {Promise<void>}
 */
export async function resetKey(key) {
  if (!key || typeof key !== "string") return;
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
 * @async
 * @returns {Promise<void>}
 */
export async function clearAll() {
  const redis = getRedisClient();

  if (redis) {
    try {
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
 * @async
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
