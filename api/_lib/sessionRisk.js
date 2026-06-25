/**
 * api/_lib/sessionRisk.js
 *
 * Utilities for tracking session risk, handling failed logins, and evaluating session states.
 */

// Config
const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_S = 600; // 10 minutes
const INACTIVITY_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours
const SESSION_EXPIRY_S = 24 * 60 * 60; // 24 hours

const memoryStore = new Map();

// ---------------------------------------------------------------------------
// Redis Client Initialization
// ---------------------------------------------------------------------------
let redisClient = null;
let RedisClass = null;

async function getRedisClient() {
  if (redisClient !== null) {
    return redisClient;
  }

  if (typeof process === "undefined" || !process.release || process.env.EDGE_RUNTIME) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL || process.env.KV_REST_API_URL || process.env.KV_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    if (!RedisClass) {
      const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ "ioredis");
      RedisClass = module.default || module;
    }

    redisClient = new RedisClass(redisUrl, {
      tls: redisUrl.startsWith("rediss://") ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 500)
    });

    redisClient.on("error", (err) => {
      console.error("[sessionRisk.js] Redis client error:", err);
    });

    return redisClient;
  } catch (err) {
    console.error("[sessionRisk.js] Failed to initialize Redis:", err);
    return null;
  }
}

export async function trackFailedLogin(username) {
  if (!username) return false;
  const key = `auth:failed:${username.toLowerCase()}`;
  
  const redis = await getRedisClient();
  
  if (!redis) {
    const data = memoryStore.get(key) || { count: 0, expires: Date.now() + FAILED_LOGIN_WINDOW_S * 1000 };
    if (Date.now() > data.expires) {
      data.count = 1;
      data.expires = Date.now() + FAILED_LOGIN_WINDOW_S * 1000;
    } else {
      data.count += 1;
    }
    memoryStore.set(key, data);
    return data.count >= FAILED_LOGIN_THRESHOLD;
  }

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, FAILED_LOGIN_WINDOW_S);
  }

  return count >= FAILED_LOGIN_THRESHOLD;
}

export async function clearFailedLogin(username) {
  if (!username) return;
  const key = `auth:failed:${username.toLowerCase()}`;
  
  const redis = await getRedisClient();
  if (!redis) {
    memoryStore.delete(key);
    return;
  }
  
  await redis.del(key);
}

export async function registerSession(sessionId, userId, ip) {
  const key = `session:${sessionId}`;
  const sessionData = {
    userId,
    ip,
    status: "active",
    lastActive: Date.now(),
    riskScore: 0,
  };

  const redis = await getRedisClient();
  if (!redis) {
    memoryStore.set(key, sessionData);
    return;
  }

  await redis.set(key, JSON.stringify(sessionData), 'EX', SESSION_EXPIRY_S);
}

export async function getSessionState(sessionId) {
  const key = `session:${sessionId}`;
  
  const redis = await getRedisClient();
  if (!redis) {
    const data = memoryStore.get(key);
    if (!data) return null;
    if (Date.now() - data.lastActive > INACTIVITY_THRESHOLD_MS && data.status === "active") {
      data.status = "requires_reauth";
    }
    return data;
  }

  const res = await redis.get(key);
  if (!res) return null;

  let sessionData;
  try {
    sessionData = JSON.parse(res);
  } catch(error) {
    console.error("[sessionRisk] Failed to parse session data", { sessionId, key, error: error.message });
    return null;
  }

  if (Date.now() - sessionData.lastActive > INACTIVITY_THRESHOLD_MS && sessionData.status === "active") {
    sessionData.status = "requires_reauth";
    // Optimistically update KV in background
    redis.set(key, JSON.stringify(sessionData), 'KEEPTTL').catch((error) => {
      console.error("[sessionRisk] Background Redis update failed", { key, error: error.message });
    });
  }

  return sessionData;
}

export async function updateSessionActivity(sessionId) {
  const sessionData = await getSessionState(sessionId);
  if (!sessionData) return;

  sessionData.lastActive = Date.now();
  
  const key = `session:${sessionId}`;
  
  const redis = await getRedisClient();
  if (!redis) {
    memoryStore.set(key, sessionData);
    return;
  }

  await redis.set(key, JSON.stringify(sessionData), 'EX', SESSION_EXPIRY_S);
}

export async function setSessionStatus(sessionId, status) {
  const sessionData = await getSessionState(sessionId);
  if (!sessionData) return;

  sessionData.status = status;
  
  const key = `session:${sessionId}`;
  
  const redis = await getRedisClient();
  if (!redis) {
    memoryStore.set(key, sessionData);
    return;
  }

  await redis.set(key, JSON.stringify(sessionData), 'EX', SESSION_EXPIRY_S);
}
