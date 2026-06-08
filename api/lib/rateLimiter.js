/**
 * Server-side rate limiter for serverless API endpoints.
 *
 * Provides a sliding-window rate limiter keyed by client identifier (typically
 * IP address). Unlike client-side limiters, this enforcement cannot be bypassed
 * by refreshing the page, opening a new tab, or using developer tools.
 *
 * This mirrors the throttling already applied to the GitHub proxy (60 req/min)
 * and AI recommendation (10 req/min) endpoints, extending the same protection
 * to the authentication endpoints that previously had none.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 });
 *   const result = limiter.check(clientIp);
 *   if (!result.allowed) {
 *     return res.status(429).json({ error: "Too many requests", retryAfter: result.retryAfter });
 *   }
 */

/**
 * Creates a sliding-window rate limiter.
 *
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.maxRequests - Maximum requests allowed per window per key
 * @returns {Object} Rate limiter instance with check() and reset() methods
 */
export function createRateLimiter({ windowMs = 60000, maxRequests = 5 } = {}) {
  // Map of key -> array of request timestamps (ms)
  const requestLog = new Map();
  let lastSweep = Date.now();
  const sweepInterval = Math.max(windowMs, 60000);

  /**
   * Removes timestamps outside the active window and prunes empty keys.
   * Called opportunistically to keep memory bounded in long-lived processes.
   */
  function sweep(now) {
    if (now - lastSweep < sweepInterval) return;
    const cutoff = now - windowMs;
    // Asynchronous chunked sweep to avoid blocking event loop
    setTimeout(() => {
      const keys = Array.from(requestLog.keys());
      let i = 0;
      function chunk() {
        const end = Math.min(i + 100, keys.length);
        for (; i < end; i++) {
          const key = keys[i];
          const timestamps = requestLog.get(key);
          if (timestamps) {
            const live = timestamps.filter(ts => ts > cutoff);
            if (live.length === 0) requestLog.delete(key);
            else requestLog.set(key, live);
          }
        }
        if (i < keys.length) setTimeout(chunk, 0);
      }
      chunk();
    }, 0);
    lastSweep = now;
  }

  return {
    /**
     * Records a request for the given key and reports whether it is allowed.
     *
     * @param {string} key - Client identifier (e.g. IP address)
     * @returns {{ allowed: boolean, remaining: number, retryAfter: number, limit: number }}
     *   retryAfter is in seconds and is 0 when the request is allowed.
     */
    check(key) {
      const identifier = key || "unknown";
      const now = Date.now();
      sweep(now);

      const cutoff = now - windowMs;
      const timestamps = (requestLog.get(identifier) || []).filter(
        (ts) => ts > cutoff
      );

      if (timestamps.length >= maxRequests) {
        const oldest = timestamps[0];
        const retryAfterMs = oldest + windowMs - now;
        requestLog.set(identifier, timestamps);
        return {
          allowed: false,
          remaining: 0,
          retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)),
          limit: maxRequests,
        };
      }

      timestamps.push(now);
      requestLog.set(identifier, timestamps);

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - timestamps.length),
        retryAfter: 0,
        limit: maxRequests,
      };
    },

    /**
     * Clears recorded requests for a key, or all keys when key is omitted.
     * Primarily used in tests and after a successful authentication.
     *
     * @param {string} [key]
     */
    reset(key) {
      if (key === undefined) {
        requestLog.clear();
      } else {
        requestLog.delete(key);
      }
    },

    /**
     * Returns the number of distinct keys currently tracked.
     * Useful for monitoring and tests.
     *
     * @returns {number}
     */
    size() {
      return requestLog.size;
    },
  };
}

/**
 * Shared limiter instances for the authentication endpoints.
 *
 * Login is stricter than signup because credential stuffing targets login.
 * Both windows are one minute to match the existing proxy throttles.
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 5,
});

export const signupRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 3,
});

/**
 * Applies a rate limiter to a request and writes a 429 response when exceeded.
 *
 * Centralises the standard headers (Retry-After, X-RateLimit-*) so every
 * endpoint reports limits consistently.
 *
 * @param {Object} limiter - A limiter from createRateLimiter
 * @param {string} clientIp - Caller IP address
 * @param {Object} res - Response object exposing status()/setHeader()/json()
 * @returns {boolean} true when the request may proceed, false when blocked
 */
export function enforceRateLimit(limiter, clientIp, res) {
  const result = limiter.check(clientIp);

  if (typeof res.setHeader === "function") {
    res.setHeader("X-RateLimit-Limit", String(result.limit));
    res.setHeader("X-RateLimit-Remaining", String(result.remaining));
  }

  if (!result.allowed) {
    if (typeof res.setHeader === "function") {
      res.setHeader("Retry-After", String(result.retryAfter));
    }
    res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    });
    return false;
  }

  return true;
}
