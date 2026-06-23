/**
 * api/_lib/distributed-lock.js
 *
 * True distributed lock implementation using Redis.
 *
 * This module provides distributed locking capabilities across multiple
 * application instances (containers, pods, VMs, serverless functions).
 *
 * Architecture:
 * - Production: Uses Redis for distributed coordination
 * - Development/Testing: Uses in-memory Map for local testing
 *
 * Lock acquisition uses Redis SET with NX PX for atomicity:
 *   SET lock:key owner NX PX ttl
 *
 * Lock release uses Lua script for atomic ownership validation:
 *   Only the lock owner may release the lock.
 *
 * SECURITY: Fail-closed behavior in production - if Redis is unavailable,
 * the application will fail to start rather than silently falling back to
 * insecure in-memory locking.
 */

import Redis from "ioredis";
import { randomUUID } from "crypto";

// Redis client singleton (lazy initialization)
let redisClient = null;

// Lock key prefix for namespacing
const LOCK_KEY_PREFIX = "lock:";

// Lua script for safe lock release (atomic ownership validation)
// Compares ownerId from stored JSON to ensure only the lock owner can release
const RELEASE_LOCK_SCRIPT = `
  local currentValue = redis.call("GET", KEYS[1])
  if not currentValue then
    return 0
  end
  local lockData = cjson.decode(currentValue)
  if lockData.ownerId == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  end
  return 0
`;

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
 * Checks if distributed lock storage is configured.
 *
 * @returns {boolean} True if Redis URL is configured
 */
function isDistributedLockStorageConfigured() {
  return !!process.env.DISTRIBUTED_LOCK_REDIS_URL || !!process.env.RATE_LIMIT_REDIS_URL;
}

/**
 * Checks if in-memory lock storage is allowed.
 *
 * @returns {boolean} True if in-memory fallback is allowed
 */
function isInMemoryLockStorageAllowed() {
  const nodeEnv = process.env.NODE_ENV?.toLowerCase()?.trim();
  return nodeEnv === "development" || nodeEnv === "test";
}

/**
 * Gets or creates the Redis client.
 *
 * @returns {Redis|null} Redis client or null if not configured
 * @throws {Error} If Redis connection fails in production
 */
function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  registerCleanupHook();

  if (!isDistributedLockStorageConfigured()) {
    return null;
  }

  try {
    // Use dedicated lock Redis URL if available, otherwise reuse rate-limit Redis
    const redisUrl = process.env.DISTRIBUTED_LOCK_REDIS_URL || process.env.RATE_LIMIT_REDIS_URL;
    if (!redisUrl) {
      console.error("[DISTRIBUTED_LOCK] No Redis URL configured. Set DISTRIBUTED_LOCK_REDIS_URL or RATE_LIMIT_REDIS_URL.");
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
      console.error("[DISTRIBUTED_LOCK] Redis client error:", err);
    });

    client.on("connect", () => {
      console.log("[DISTRIBUTED_LOCK] Redis connected");
    });

    redisClient = client;
    return redisClient;
  } catch (err) {
    console.error("[DISTRIBUTED_LOCK] Failed to create Redis client:", err);
    redisClient = null;
    return null;
  }
}

/**
 * Distributed lock manager using Redis.
 */
class DistributedLockManager {
  constructor() {
    this.redis = getRedisClient();
    this.validateProductionSetup();
  }

  /**
   * Validates production setup.
   *
   * @throws {Error} If distributed locking is required but unavailable
   */
  validateProductionSetup() {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase()?.trim();
    if (nodeEnv === "production") {
      if (!this.redis) {
        throw new Error(
          "Distributed lock storage is required in production. Configure DISTRIBUTED_LOCK_REDIS_URL or RATE_LIMIT_REDIS_URL."
        );
      }
    }
  }

  /**
   * Acquires a distributed lock with retry logic.
   *
   * @param {string} key - Lock key
   * @param {number} ttlMs - Time-to-live in milliseconds (default: 30000)
   * @param {Object} options - Optional configuration
   * @param {number} options.retries - Number of retry attempts (default: 3)
   * @param {number} options.retryDelayMs - Initial retry delay in milliseconds (default: 100)
   * @returns {Promise<Function>} Release function
   * @throws {Error} If lock acquisition fails after retries
   */
  async acquire(key, ttlMs = 30000, options = {}) {
    const { retries = 3, retryDelayMs = 100 } = options;

    if (this.redis) {
      return this.acquireRedisLock(key, ttlMs, retries, retryDelayMs);
    } else {
      // Fallback to in-memory for development/testing
      if (!isInMemoryLockStorageAllowed()) {
        throw new Error(
          "Distributed lock storage is required. Configure DISTRIBUTED_LOCK_REDIS_URL or RATE_LIMIT_REDIS_URL."
        );
      }
      console.warn("[DISTRIBUTED_LOCK] Using in-memory fallback for locking");
      return this.acquireInMemoryLock(key, ttlMs);
    }
  }

  /**
   * Acquires a Redis-based distributed lock.
   *
   * @param {string} key - Lock key
   * @param {number} ttlMs - Time-to-live in milliseconds
   * @param {number} retries - Number of retry attempts
   * @param {number} retryDelayMs - Initial retry delay in milliseconds
   * @returns {Promise<Function>} Release function
   */
  async acquireRedisLock(key, ttlMs, retries, retryDelayMs) {
    const lockKey = `${LOCK_KEY_PREFIX}${key}`;
    const ownerId = randomUUID();
    const lockValue = JSON.stringify({
      ownerId,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });

    let attempt = 0;
    while (attempt <= retries) {
      try {
        // Atomic SET with NX (only if not exists) and PX (expiration in milliseconds)
        const result = await this.redis.set(lockKey, lockValue, "NX", "PX", ttlMs);

        if (result === "OK") {
          console.log(`[DISTRIBUTED_LOCK] Lock acquired: ${key}`);
          return () => this.releaseRedisLock(lockKey, ownerId);
        } else {
          // Lock already held by another instance
          attempt++;
          if (attempt <= retries) {
            const delay = retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`[DISTRIBUTED_LOCK] Lock acquisition failed (attempt ${attempt}/${retries}), retrying in ${delay}ms: ${key}`);
            await this.sleep(delay);
          }
        }
      } catch (err) {
        console.error(`[DISTRIBUTED_LOCK] Redis error during lock acquisition: ${err.message}`);
        attempt++;
        if (attempt <= retries) {
          const delay = retryDelayMs * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        } else {
          throw new Error(`Failed to acquire lock after ${retries} retries: ${err.message}`);
        }
      }
    }

    console.error(`[DISTRIBUTED_LOCK] Lock acquisition failed after ${retries} retries: ${key}`);
    throw new Error(`Failed to acquire lock for key: ${key}`);
  }

  /**
   * Releases a Redis-based distributed lock safely.
   *
   * Uses Lua script to ensure only the lock owner can release it.
   *
   * @param {string} lockKey - Full lock key with prefix
   * @param {string} ownerId - Lock owner ID
   * @returns {Promise<void>}
   */
  async releaseRedisLock(lockKey, ownerId) {
    try {
      // Extract ownerId from the stored value for comparison
      const currentValue = await this.redis.get(lockKey);
      if (!currentValue) {
        console.warn(`[DISTRIBUTED_LOCK] Lock already expired or released: ${lockKey}`);
        return;
      }

      const lockData = JSON.parse(currentValue);
      if (lockData.ownerId !== ownerId) {
        console.error(`[DISTRIBUTED_LOCK] Lock ownership mismatch. Cannot release lock owned by another instance: ${lockKey}`);
        return;
      }

      // Use Lua script for atomic release with ownership validation
      const result = await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, lockKey, lockData.ownerId);
      if (result === 1) {
        console.log(`[DISTRIBUTED_LOCK] Lock released: ${lockKey.replace(LOCK_KEY_PREFIX, "")}`);
      } else {
        console.warn(`[DISTRIBUTED_LOCK] Lock release failed (ownership mismatch or already released): ${lockKey}`);
      }
    } catch (err) {
      console.error(`[DISTRIBUTED_LOCK] Error during lock release: ${err.message}`);
    }
  }

  /**
   * Acquires an in-memory lock (fallback for development/testing).
   *
   * @param {string} key - Lock key
   * @param {number} ttlMs - Time-to-live in milliseconds (ignored for in-memory)
   * @returns {Promise<Function>} Release function
   */
  async acquireInMemoryLock(key, ttlMs) {
    if (!this.inMemoryLocks) {
      this.inMemoryLocks = new Map();
    }

    let lock = this.inMemoryLocks.get(key);
    const prevLock = lock;

    // Create new lock for this acquisition
    let releaseFn = null;
    const promise = new Promise((resolve) => {
      releaseFn = resolve;
    });

    lock = {
      releaseFn,
      promise,
    };

    // Set the new lock in the map
    this.inMemoryLocks.set(key, lock);

    // Wait for previous lock to be released (FIFO ordering)
    if (prevLock) {
      await prevLock.promise;
    }

    let released = false;
    return () => {
      if (released) return;
      released = true;

      // Release the lock
      if (lock.releaseFn) {
        lock.releaseFn();
      }

      // Only delete from map if this is still the current lock
      if (this.inMemoryLocks.get(key) === lock) {
        this.inMemoryLocks.delete(key);
      }
    };
  }

  /**
   * Sleep utility for retry delays.
   *
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let instance = null;

/**
 * Gets the distributed lock manager singleton.
 *
 * @returns {DistributedLockManager} Lock manager instance
 * @throws {Error} If production setup is invalid
 */
export function getLockManager() {
  if (!instance) {
    instance = new DistributedLockManager();
  }
  return instance;
}

/**
 * Resets the lock manager singleton (for testing only).
 */
export function resetLockManager() {
  if (instance && instance.redis) {
    // Don't close Redis connection, just reset the instance
  }
  instance = null;
}

/**
 * Executes a function within a distributed lock.
 *
 * @param {string} key - Lock key
 * @param {Function} fn - Function to execute within lock
 * @param {number} ttlMs - Lock time-to-live in milliseconds (default: 30000)
 * @param {Object} options - Optional lock acquisition options
 * @returns {Promise<any>} Result of the function
 */
export async function withLock(key, fn, ttlMs = 30000, options = {}) {
  const manager = getLockManager();
  const release = await manager.acquire(key, ttlMs, options);
  try {
    return await fn();
  } finally {
    release();
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
      instance = null;
    } catch (err) {
      console.error("[DISTRIBUTED_LOCK] Failed to close Redis connection:", err);
    }
  }
}
