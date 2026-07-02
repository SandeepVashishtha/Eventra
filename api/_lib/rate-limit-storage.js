/**
 * api/lib/rate-limit-storage.js
 *
 * Distributed rate-limit storage abstraction layer.
 */

import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "./rate-limit-config.js";

let redisClient = null;
let RedisClass = null;
const inMemoryStore = new Map();
let cleanupRegistered = false;

// ─── Process cleanup ──────────────────────────────────────────────────────────
async function closeRedisQuietly() {
  if (!redisClient) return;
  try { await redisClient.quit(); } catch { /* ignore */ }
  redisClient = null;
}

function registerCleanupHook() {
  if (cleanupRegistered) return;
  cleanupRegistered = true;
  if (typeof process === "undefined" || typeof process.on !== "function") return;
  process.on("beforeExit", closeRedisQuietly);
  process.on("SIGINT", () => { closeRedisQuietly(); process.exit(0); });
  process.on("SIGTERM", () => { closeRedisQuietly(); process.exit(0); });
}

// ─── Redis initialisation ─────────────────────────────────────────────────────
async function loadRedisLibrary() {
  if (!RedisClass) {
    const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ "ioredis");
    RedisClass = module.default || module;
  }
  return RedisClass;
}

async function createRedisClientInstance(redisUrl) {
  const Redis = await loadRedisLibrary();
  return new Redis(redisUrl, {
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 500)),
  });
}

function isEdgeOrNonNode() {
  return typeof process === "undefined" || !process.release || process.env.EDGE_RUNTIME;
}

async function buildRedisClient() {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
  if (!redisUrl) {
    console.error("[rate-limit-storage.js] No Redis URL configured. Set RATE_LIMIT_REDIS_URL.");
    return null;
  }
  const client = await createRedisClientInstance(redisUrl);
  client.on("error", (err) => console.error("[rate-limit-storage.js] Redis client error:", err));
  return client;
}

/**
 * Gets or creates the Redis client.
 */
async function getRedisClient() {
  if (redisClient !== null) return redisClient;
  if (isEdgeOrNonNode()) return null;

  registerCleanupHook();

  if (!isDistributedRateLimitStorageConfigured()) return null;

  try {
    redisClient = await buildRedisClient();
    return redisClient;
  } catch (err) {
    console.error("[rate-limit-storage.js] Failed to create Redis client:", err);
    redisClient = null;
    return null;
  }
}

// ─── Fail-mode helpers ────────────────────────────────────────────────────────
function getFailMode() {
  return process.env.RATE_LIMIT_FAIL_MODE?.toLowerCase()?.trim() || "fallback";
}

function throwIfFailClosed(message) {
  if (getFailMode() === "closed") throw new Error(message);
}

// ─── In-memory increment ──────────────────────────────────────────────────────
function incrementInMemory(key, windowMs) {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || now - record.start > windowMs) {
    inMemoryStore.set(key, { start: now, count: 1 });
    return { count: 1, ttl: windowMs };
  }

  record.count++;
  return { count: record.count, ttl: Math.max(0, windowMs - (now - record.start)) };
}

// ─── Redis increment ──────────────────────────────────────────────────────────
const INCR_LUA =
  "local c = redis.call('incr', KEYS[1]); if c == 1 then redis.call('pexpire', KEYS[1], ARGV[1]) end; return c;";

async function runRedisIncrement(redis, key, windowMs) {
  const count = await redis.eval(INCR_LUA, 1, key, windowMs);
  return { count, ttl: windowMs };
}

/**
 * Increments a counter atomically with expiration.
 */
export async function incrementWithExpiration(key, windowMs, options = {}) {
  if (options.forceInMemoryFallback) {
    console.warn("[RATE_LIMIT] Using forced in-memory fallback for rate limiting");
    return incrementInMemory(key, windowMs);
  }

  const redis = await getRedisClient();
  if (!redis) {
    if (!isInMemoryRateLimitStorageAllowed()) {
      throwIfFailClosed("Distributed rate-limit storage is required in production. Configure RATE_LIMIT_REDIS_URL (fail-closed mode).");
      console.warn("[RATE_LIMIT] Distributed storage not configured, using in-memory fallback");
    }
    return incrementInMemory(key, windowMs);
  }

  try {
    return await runRedisIncrement(redis, key, windowMs);
  } catch (err) {
    console.error("[RATE_LIMIT] Distributed storage (Redis) unavailable:", err.message);
    throwIfFailClosed("Rate-limit storage unavailable. Cannot safely enforce rate limits without distributed storage (fail-closed mode).");
    console.warn("[RATE_LIMIT] Falling back to in-memory rate limiting");
    return incrementInMemory(key, windowMs);
  }
}

/**
 * Resets a rate-limit key.
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

// ─── clearAll helpers (split to avoid nesting) ────────────────────────────────
async function clearRedis(redis) {
  if (redis.status !== "ready") {
    console.warn("[rate-limit-storage.js] Redis not connected, clearing in-memory store instead");
    inMemoryStore.clear();
    return;
  }
  if (process.env.NODE_ENV === "test") {
    await redis.flushdb();
  }
}

/**
 * Clears all rate-limit data.
 */
export async function clearAll() {
  const redis = await getRedisClient();
  if (!redis) { inMemoryStore.clear(); return; }

  try {
    await clearRedis(redis);
  } catch (err) {
    console.error("[rate-limit-storage.js] Failed to clear Redis:", err);
    inMemoryStore.clear();
  }
}

/**
 * Closes the Redis connection.
 */
export async function close() {
  try {
    await closeRedisQuietly();
  } catch (err) {
    console.error("[rate-limit-storage.js] Failed to close Redis connection:", err);
  }
}
