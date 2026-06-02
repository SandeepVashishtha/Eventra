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
 * @param {Object} options
 * @param {number} options.maxTokens - Maximum tokens in the bucket
 * @param {number} options.refillRate - Tokens added per second
 * @param {number} [options.initialTokens] - Initial tokens (defaults to maxTokens)
 * @returns {Object} Rate limiter instance
 */
export function createRateLimiter({
  maxTokens = 10,
  refillRate = 2,
  initialTokens,
}) {
  let tokens = initialTokens ?? maxTokens;
  let lastRefill = Date.now();

  function refill() {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
    lastRefill = now;
  }

  return {
    /**
     * Attempts to consume a token. Returns true if allowed.
     * @param {number} [cost=1] - Number of tokens to consume
     * @returns {boolean}
     */
    tryConsume(cost = 1) {
      refill();
      if (tokens >= cost) {
        tokens -= cost;
        return true;
      }
      return false;
    },

    /**
     * Returns time in ms until the next token is available.
     * @returns {number}
     */
    getRetryAfterMs() {
      refill();
      if (tokens >= 1) return 0;
      const deficit = 1 - tokens;
      return Math.ceil((deficit / refillRate) * 1000);
    },

    /**
     * Returns current token count.
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
 * @param {Function} fn - The async function to rate-limit
 * @param {Object} limiterOptions - Options for createRateLimiter
 * @returns {Function} Rate-limited function
 */
export function withRateLimit(fn, limiterOptions = {}) {
  const limiter = createRateLimiter({
    maxTokens: 5,
    refillRate: 1,
    ...limiterOptions,
  });

  return async function rateLimited(...args) {
    if (!limiter.tryConsume()) {
      const retryMs = limiter.getRetryAfterMs();
      throw new Error(
        `Rate limited. Please wait ${Math.ceil(retryMs / 1000)} seconds.`
      );
    }
    return fn.apply(this, args);
  };
}
