const LOCKS = new Map();

class Lock {
  constructor() {
    this.releaseFn = null;
    this.promise = new Promise((resolve) => {
      this.releaseFn = resolve;
    });
  }

  release() {
    if (this.releaseFn) {
      this.releaseFn();
      this.releaseFn = null;
    }
  }
}

class InMemoryLockManager {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key, ttlMs = 30000) {
    let lock = this.locks.get(key);
    const prevLock = lock;

    lock = new Lock();
    this.locks.set(key, lock);

    if (prevLock) {
      await prevLock.promise;
    }

    let released = false;
    return () => {
      if (released) return;
      released = true;
      lock.release();
      if (this.locks.get(key) === lock) {
        this.locks.delete(key);
      }
    };
  }
}

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
  if (!redisUrl) return null;

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
      console.error("[distributed-lock.js] Redis client error:", err);
    });
    return redisClient;
  } catch (err) {
    console.error("[distributed-lock.js] Failed to init Redis:", err);
    return null;
  }
}

class RedisLockManager {
  async acquire(key, ttlMs = 30000) {
    const redis = await getRedisClient();
    if (!redis) {
      return getLockManager(true).acquire(key, ttlMs);
    }
    
    // uuid generation 
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
    const lockKey = `lock:${key}`;
    const delay = (ms) => new Promise(res => setTimeout(res, ms));
    const start = Date.now();
    
    while (Date.now() - start < 15000) { // Wait up to 15s
      const acquired = await redis.set(lockKey, uuid, "PX", ttlMs, "NX");
      if (acquired) {
        let released = false;
        return async () => {
          if (released) return;
          released = true;
          const script = `
            if redis.call("get", KEYS[1]) == ARGV[1] then
              return redis.call("del", KEYS[1])
            else
              return 0
            end
          `;
          try {
            await redis.eval(script, 1, lockKey, uuid);
          } catch(err) {
            console.error("[distributed-lock.js] error releasing lock:", err);
          }
        };
      }
      await delay(50);
    }
    throw new Error(`Failed to acquire lock for key: ${key} within 15 seconds`);
  }
}

let instance = null;

export function getLockManager(forceInMemory = false) {
  if (forceInMemory) {
    if (!instance || !(instance instanceof InMemoryLockManager)) {
      instance = new InMemoryLockManager();
    }
    return instance;
  }

  if (!instance) {
    const hasRedis = typeof process !== "undefined" && (process.env.REDIS_URL || process.env.KV_REST_API_URL || process.env.KV_URL);
    if (hasRedis) {
      instance = new RedisLockManager();
    } else {
      instance = new InMemoryLockManager();
    }
  }
  return instance;
}

export function resetLockManager() {
  instance = null;
}

export async function withLock(key, fn, ttlMs = 30000) {
  const manager = getLockManager();
  const release = await manager.acquire(key, ttlMs);
  try {
    return await fn();
  } finally {
    await release();
  }
}
