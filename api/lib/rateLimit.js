// ---------------------------------------------------------------------------
// Shared sliding-window rate limiter (in-memory, per-key).
// For production use, replace with Redis-based implementation.
// ---------------------------------------------------------------------------

/**
 * Create a rate limiter instance with the given window and max requests.
 *
 * @param {number} windowMs  — sliding window in milliseconds (default 60s)
 * @param {number} maxRequests — max requests per window per key (default 10)
 * @returns {{ check: (key: string) => boolean, evictStale: () => void, reset: (key: string) => void }}
 */
export const createRateLimiter = (windowMs = 60_000, maxRequests = 10) => {
  const store = new Map();
  let lastEvictionAt = 0;

  const evictStale = () => {
    const now = Date.now();
    if (now - lastEvictionAt < windowMs) return;
    lastEvictionAt = now;
    for (const [key, entry] of store.entries()) {
      if (now - entry.windowStart >= windowMs) {
        store.delete(key);
      }
    }
  };

  /**
   * Returns true if the request is allowed, false if rate-limited.
   */
  const check = (key) => {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count += 1;
    return true;
  };

  /**
   * Reset the rate limit counter for a specific key (e.g. on successful login).
   */
  const reset = (key) => {
    store.delete(key);
  };

  return { check, evictStale, reset };
};
