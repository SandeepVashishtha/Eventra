import Redis from "ioredis";

let redis = null;

if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000, // 2s connect timeout for fast failover
      disconnectTimeout: 2000,
      lazyConnect: true, // Connect on demand
    });

    redis.on("error", (err) => {
      console.warn("[Redis Warn] connection error:", err.message);
    });
  } catch (err) {
    console.error("[Redis Initialization Error]:", err);
  }
} else {
  console.warn("[Redis Warn] REDIS_URL is not set. Falling back to in-memory store.");
}

export { redis };
