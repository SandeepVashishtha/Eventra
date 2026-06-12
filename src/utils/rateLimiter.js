/**
 * Token Bucket Rate Limiter
 *
 * Limits the rate of function calls on the client side.
 * Useful for preventing rapid API calls from button spam, scroll events, etc.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1 });
 *   if (limiter.tryConsume()) { // make API call }
 */

/**
 * Creates a token bucket rate limiter.
 *
 * @param {Object} options
 * @param {number} options.maxTokens    - Maximum tokens in the bucket (must be > 0)
 * @param {number} options.refillRate   - Tokens added per second (must be > 0)
 * @param {number} [options.initialTokens] - Initial tokens (defaults to maxTokens)
 * @returns {Object} Rate limiter instance
 * @throws {RangeError} When maxTokens or refillRate is not a positive finite number
 */
export function createRateLimiter({ maxTokens = 10, refillRate = 2, initialTokens }) {
  if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
    throw new RangeError(
      `createRateLimiter: maxTokens must be a positive finite number, got ${maxTokens}`
    );
  }
  if (!Number.isFinite(refillRate) || refillRate <= 0) {
    throw new RangeError(
      `createRateLimiter: refillRate must be a positive finite number, got ${refillRate}`
    );
  }

  let tokens =
    initialTokens !== undefined && Number.isFinite(initialTokens)
      ? Math.min(Math.max(0, initialTokens), maxTokens)
      : maxTokens;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = Math.max(0, (now - lastRefill) / 1000);
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
    lastRefill = now;
  }

  return {
    /**
     * Attempts to consume one or more tokens. Returns true if allowed.
     *
     * @param {number} [cost=1] - Number of tokens to consume (must be > 0)
     * @returns {boolean}
     */
    tryConsume(cost = 1) {
      if (!Number.isFinite(cost) || cost <= 0) {
        throw new RangeError(`tryConsume: cost must be a positive finite number, got ${cost}`);
      }
      refill();
      if (tokens >= cost) {
        tokens -= cost;
        return true;
      }
      return false;
    },

    /**
     * Returns time in milliseconds until the next single token is available.
     * Returns 0 if a token is already available.
     * Returns Number.MAX_SAFE_INTEGER if refillRate is effectively zero (should
     * not happen given construction-time validation, but guarded defensively).
     *
     * @returns {number}
     */
    getRetryAfterMs() {
      refill();
      if (tokens >= 1) return 0;
      // Defensive guard: refillRate was validated at construction but protect
      // against edge cases such as a frozen clock or patched object.
      if (refillRate <= 0) return Number.MAX_SAFE_INTEGER;
      const deficit = 1 - tokens;
      return Math.ceil((deficit / refillRate) * 1000);
    },

    /**
     * Returns the current whole-token count.
     *
     * @returns {number}
     */
    getTokens() {
      refill();
      return Math.floor(tokens);
    },

    /**
     * Resets the limiter to full capacity.
     */
    reset() {
      tokens = maxTokens;
      lastRefill = Date.now();
    },
  };
}

/**
 * Higher-order function that wraps an async function with rate limiting.
 *
 * @param {Function} fn             - The async function to rate-limit
 * @param {Object}   limiterOptions - Options forwarded to createRateLimiter
 * @returns {Function} Rate-limited async function
 * @throws {RangeError} When limiterOptions.maxTokens or .refillRate is invalid
 */
export function withRateLimit(fn, limiterOptions = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("withRateLimit: first argument must be a function");
  }

  const limiter = createRateLimiter({
    maxTokens: 5,
    refillRate: 1,
    ...limiterOptions,
  });

  return async function rateLimited(...args) {
    if (!limiter.tryConsume()) {
      const retryMs = limiter.getRetryAfterMs();
      const retrySec =
        retryMs === Number.MAX_SAFE_INTEGER
          ? "an unknown amount of time"
          : `${Math.ceil(retryMs / 1000)} second${Math.ceil(retryMs / 1000) === 1 ? "" : "s"}`;
      throw new Error(`Rate limited. Please wait ${retrySec}.`);
    }
    return fn.apply(this, args);
  };
}
