import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Persistent Token Blacklist via Upstash Redis
// ---------------------------------------------------------------------------
//
// Falls back to in-memory when UPSTASH_REDIS_URL is not configured (e.g.
// local development). The in-memory store resets on every cold start and
// does not provide cross-instance protection in serverless deployments.
// Set UPSTASH_REDIS_URL (and optionally UPSTASH_REDIS_TOKEN) in your
// environment to enable durable, cross-instance token revocation.
// ---------------------------------------------------------------------------

const prefix = "revoked:";

let redis = null;
let inMemoryStore = null;

try {
  if (process.env.UPSTASH_REDIS_URL) {
    const options = { url: process.env.UPSTASH_REDIS_URL };
    if (process.env.UPSTASH_REDIS_TOKEN) {
      options.token = process.env.UPSTASH_REDIS_TOKEN;
    }
    redis = new Redis(options);
  } else {
    inMemoryStore = new Set();
    console.warn(
      "[tokenStore] UPSTASH_REDIS_URL not set — using in-memory token blacklist. " +
      "Revoked tokens will remain valid across cold starts in serverless deployments."
    );
  }
} catch (err) {
  inMemoryStore = new Set();
  console.warn(
    "[tokenStore] Failed to initialize Upstash Redis — using in-memory fallback:",
    err.message
  );
}

export const blacklistToken = async (token, ttlSeconds) => {
  if (redis) {
    await redis.set(`${prefix}${token}`, "1", { ex: ttlSeconds || 86400 });
  } else {
    inMemoryStore.add(token);
  }
};

export const isTokenBlacklisted = async (token) => {
  if (redis) {
    const result = await redis.exists(`${prefix}${token}`);
    return result === 1;
  }
  return inMemoryStore.has(token);
};
