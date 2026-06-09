import { redis } from "./redis.js";

// Lua script for sliding window rate limiting
const LUA_SLIDING_WINDOW = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local windowMs = tonumber(ARGV[2])
local maxRequests = tonumber(ARGV[3])
local randomVal = ARGV[4]
local clearBefore = now - windowMs

-- Clean up stale logs
redis.call('ZREMRANGEBYSCORE', key, '-inf', clearBefore)

-- Get current request count
local currentCount = redis.call('ZCARD', key)

local allowed = 0
local remaining = 0

if currentCount < maxRequests then
  allowed = 1
  redis.call('ZADD', key, now, now .. '_' .. randomVal)
  redis.call('EXPIRE', key, math.ceil(windowMs / 1000) * 2) -- keep key alive for 2x window for buffer
  remaining = maxRequests - currentCount - 1
else
  allowed = 0
  remaining = 0
end

-- Get the oldest timestamp in the window to calculate retryAfter
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local oldestScore = 0
if #oldest > 0 then
  oldestScore = tonumber(oldest[2])
end

return { allowed, remaining, oldestScore }
`;

// In-memory fallback store
const fallbackStore = new Map();
let lastCleanupAt = 0;

function sweepFallbackStore(now, windowMs) {
  if (now - lastCleanupAt < windowMs) return;
  const cutoff = now - windowMs;
  for (const [key, timestamps] of fallbackStore.entries()) {
    const live = timestamps.filter((ts) => ts > cutoff);
    if (live.length === 0) {
      fallbackStore.delete(key);
    } else {
      fallbackStore.set(key, live);
    }
  }
  lastCleanupAt = now;
}

function checkFallbackLimit(key, now, windowMs, maxRequests) {
  sweepFallbackStore(now, windowMs);
  const cutoff = now - windowMs;
  const timestamps = (fallbackStore.get(key) || []).filter((ts) => ts > cutoff);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      oldestScore: oldest,
    };
  }

  timestamps.push(now);
  fallbackStore.set(key, timestamps);
  return {
    allowed: true,
    remaining: maxRequests - timestamps.length,
    oldestScore: timestamps[0] || now,
  };
}

/**
 * Checks rate limit for a given key.
 *
 * @param {string} key - Unique key for rate limiting (e.g. user ID or global key)
 * @param {number} windowMs - Window size in milliseconds
 * @param {number} maxRequests - Max requests allowed in the window
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfter: number, limit: number }>}
 */
export async function checkRateLimit(key, windowMs = 60000, maxRequests = 10) {
  const now = Date.now();
  let allowed = false;
  let remaining = 0;
  let oldestScore = 0;
  let isFallback = false;

  if (redis) {
    try {
      const result = await redis.eval(
        LUA_SLIDING_WINDOW,
        1,
        key,
        now,
        windowMs,
        maxRequests,
        Math.random().toString()
      );
      allowed = result[0] === 1;
      remaining = result[1];
      oldestScore = result[2];
    } catch (err) {
      console.warn("[Redis RateLimiter Error] Redis failed, falling back to memory:", err.message);
      isFallback = true;
    }
  } else {
    isFallback = true;
  }

  if (isFallback) {
    const result = checkFallbackLimit(key, now, windowMs, maxRequests);
    allowed = result.allowed;
    remaining = result.remaining;
    oldestScore = result.oldestScore;
  }

  // Quota Metrics Logging
  const used = maxRequests - remaining;
  const usagePercent = (used / maxRequests) * 100;
  
  console.log(
    `[METRICS_RATE_LIMIT] Key: ${key}, Limit: ${maxRequests}, Used: ${used}, Remaining: ${remaining}, Usage: ${usagePercent.toFixed(1)}%, Store: ${isFallback ? "Memory" : "Redis"}`
  );

  // Alert if quota usage is high (>= 80%)
  if (usagePercent >= 80) {
    console.warn(
      `[QUOTA_ALERT] Rate limit key "${key}" is at high usage: ${usagePercent.toFixed(1)}% (${used}/${maxRequests}).`
    );
  }

  // Calculate retryAfter in seconds
  let retryAfter = 0;
  if (!allowed) {
    const retryAfterMs = oldestScore > 0 ? (oldestScore + windowMs - now) : windowMs;
    retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));
  }

  return {
    allowed,
    remaining,
    retryAfter,
    limit: maxRequests,
  };
}
