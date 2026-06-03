// ---------------------------------------------------------------------------
// Shared sliding-window rate limiter (in-memory, per-key).
// Uses timestamp sliding window to prevent boundary bursts:
// each request is tracked individually and counted only if it falls within
// the rolling window. For production use, replace with Redis-based
// implementation for distributed enforcement.
// ---------------------------------------------------------------------------

/**
 * Create a rate limiter instance with the given window and max requests.
 *
 * @param {number} windowMs  — sliding window in milliseconds (default 60s)
 * @param {number} maxRequests — max requests per window per key (default 5)
 * @returns {{ check: (key: string) => boolean, evictStale: () => void, reset: (key: string) => void }}
 */
export const createRateLimiter = (windowMs = 60_000, maxRequests = 5) => {
  const store = new Map();
  let lastEvictionAt = 0;

  const evictStale = () => {
    const now = Date.now();
    if (now - lastEvictionAt < windowMs) return;
    lastEvictionAt = now;
    const cutoff = now - windowMs;
    for (const [key, timestamps] of store.entries()) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  };

  /**
   * Returns true if the request is allowed, false if rate-limited.
   * Uses sliding window of timestamps per key.
   */
  const check = (key) => {
    const now = Date.now();
    const cutoff = now - windowMs;
    const timestamps = store.get(key) || [];
    const validTimestamps = timestamps.filter((t) => t > cutoff);

    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    store.set(key, validTimestamps);
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
