/**
 * Token Bucket Rate Limiter
 *
 * Limits the rate of function calls on the client side.
 * Useful for preventing rapid API calls from button spam, scroll events, etc.
 *
 * Enhancements over the base implementation:
 *   - `getBackoffMs(attempt)` — full-jitter exponential back-off helper so that
 *     concurrent clients don't all retry at the same instant (thundering herd).
 *   - `getExactTokens()` — returns raw floating-point token count for
 *     consumers that need fractional precision (e.g. progress indicators).
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxTokens: 5, refillRate: 1 });
 *   if (limiter.tryConsume()) { // make API call }
 *   else {
 *     const delayMs = limiter.getBackoffMs(attempt);
 *     await sleep(delayMs);
 *   }
 */

/**
 * Creates a token bucket rate limiter.
 * @param {Object} [options]
 * @param {number} [options.maxTokens=10] - Maximum tokens in the bucket
 * @param {number} [options.refillRate=2] - Tokens added per second
 * @param {number} [options.initialTokens] - Initial tokens (defaults to maxTokens)
 * @param {string} [options.channelName] - Optional BroadcastChannel name for multi-tab sync
 * @returns {Object} Rate limiter instance
 * @throws {RangeError} When maxTokens or refillRate is not a positive finite number
 */
export function createRateLimiter({
  maxTokens = 10,
  refillRate = 2,
  initialTokens,
  channelName,
} = {}) {
  if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
    throw new RangeError("maxTokens must be a positive finite number");
  }
  if (!Number.isFinite(refillRate) || refillRate <= 0) {
    throw new RangeError("refillRate must be a positive finite number");
  }

  let tokens = initialTokens ?? maxTokens;
  let lastRefill = Date.now();
  let lockedUntil = 0;

  // Multi-tab synchronization via BroadcastChannel
  const channel =
    channelName && typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(`rate_limiter_${channelName}`)
      : null;

  if (channel) {
    channel.onmessage = (event) => {
      if (event.data?.type === "CONSUME") {
        tokens = Math.max(0, tokens - (event.data.cost || 1));
      } else if (event.data?.type === "PENALIZE") {
        lockedUntil = Math.max(lockedUntil, Date.now() + event.data.cooldownMs);
      }
    };
  }

  function refill() {
    const now = Date.now();
    const elapsed = Math.min(Math.max(0, (now - lastRefill) / 1000), 60);
    if (elapsed === 0) return;
    tokens = Math.min(maxTokens, tokens + elapsed * refillRate);
    lastRefill = now;
  }

  return {
    /**
     * Attempts to consume tokens. Returns true if allowed.
     * @param {number} [cost=1] - Number of tokens to consume
     * @returns {boolean}
     */
    tryConsume(cost = 1) {
      if (!Number.isFinite(cost) || cost <= 0) {
        throw new RangeError("cost must be a positive finite number");
      }

      if (Date.now() < lockedUntil) return false;

      refill();
      if (tokens >= cost) {
        tokens -= cost;
        if (channel) {
          channel.postMessage({ type: "CONSUME", cost });
        }
        return true;
      }
      return false;
    },

    /**
     * Returns time in ms until the requested number of tokens is available.
     * @param {number} [cost=1] - Number of tokens required
     * @returns {number} Time in milliseconds to wait
     */
    getRetryAfterMs(cost = 1) {
      const now = Date.now();
      let cooldownWait = 0;
      if (now < lockedUntil) {
        cooldownWait = lockedUntil - now;
      }

      refill();
      if (tokens >= cost && cooldownWait === 0) return 0;

      const deficit = Math.max(0, cost - tokens);
      const refillWait = Math.ceil((deficit / refillRate) * 1000);

      return Math.max(cooldownWait, refillWait);
    },

    /**
     * Temporarily locks token consumption during server-directed cooldowns (e.g. HTTP 429 Retry-After).
     * @param {number} cooldownMs - Duration in ms to lock consumption
     */
    penalize(cooldownMs) {
      lockedUntil = Date.now() + cooldownMs;
      tokens = 0;
      if (channel) {
        channel.postMessage({ type: "PENALIZE", cooldownMs });
      }
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
      lockedUntil = 0;
    },

    /**
     * Cleans up channel resources.
     */
    destroy() {
      if (channel) {
        channel.close();
      }
    },

    /**
     * Returns the raw floating-point token count without floor-rounding.
     * Useful for progress indicators or smooth UI feedback.
     *
     * @returns {number}
     */
    getExactTokens() {
      refill();
      return tokens;
    },

    /**
     * Returns a jittered exponential back-off delay in milliseconds.
     *
     * Uses the "Full Jitter" strategy from the AWS Builder's Library:
     *   delay = random(0, min(cap, baseMs * 2^attempt))
     *
     * This prevents thundering-herd problems when many clients are rate-limited
     * and all retry at the same time.
     *
     * @param {number} attempt   - Zero-based retry attempt index
     * @param {Object} [opts]
     * @param {number} [opts.baseMs=500]   - Base delay in ms
     * @param {number} [opts.capMs=30000]  - Maximum delay in ms
     * @returns {number}  Delay in milliseconds
     */
    getBackoffMs(attempt, { baseMs = 500, capMs = 30_000 } = {}) {
      const exponential = baseMs * Math.pow(2, Math.max(0, attempt));
      const capped = Math.min(capMs, exponential);
      // Full jitter: random in [0, capped)
      return Math.floor(Math.random() * capped);
    },
  };
}

/**
 * Higher-order function that wraps an async function with rate limiting & queuing.
 * @param {Function} fn - The async function to rate-limit
 * @param {Object} [options] - Limiter and execution options
 * @param {number} [options.cost=1] - Token cost per call
 * @param {'throw'|'queue'} [options.mode='throw'] - Execution strategy when limited
 * @param {number} [options.maxQueueSize=20] - Maximum allowed queued items
 * @returns {Function} Rate-limited function
 */
export function withRateLimit(fn, options = {}) {
  if (typeof fn !== "function") {
    throw new TypeError("withRateLimit requires a function as its first argument");
  }

  const {
    cost = 1,
    mode = "throw",
    maxQueueSize = 20,
    ...limiterOptions
  } = options;

  const limiter = createRateLimiter({
    maxTokens: 5,
    refillRate: 1,
    ...limiterOptions,
  });

  const executionQueue = [];
  let isProcessingQueue = false;

  async function processQueue() {
    if (isProcessingQueue || executionQueue.length === 0) return;
    isProcessingQueue = true;

    while (executionQueue.length > 0) {
      const nextItem = executionQueue[0];

      if (limiter.tryConsume(nextItem.cost)) {
        executionQueue.shift();
        try {
          const result = await fn.apply(nextItem.context, nextItem.args);
          nextItem.resolve(result);
        } catch (err) {
          nextItem.reject(err);
        }
      } else {
        const waitMs = limiter.getRetryAfterMs(nextItem.cost);
        await new Promise((resolve) => setTimeout(resolve, Math.max(50, waitMs)));
      }
    }

    isProcessingQueue = false;
  }

  return function rateLimited(...args) {
    const context = this;

    if (mode === "queue") {
      if (executionQueue.length >= maxQueueSize) {
        return Promise.reject(
          new Error("Rate limit queue overflow. Too many pending requests.")
        );
      }

      return new Promise((resolve, reject) => {
        executionQueue.push({ resolve, reject, context, args, cost });
        processQueue();
      });
    }

    if (!limiter.tryConsume(cost)) {
      const retryMs = limiter.getRetryAfterMs(cost);
      const error = new Error(
        `Rate limited. Please wait ${Math.ceil(retryMs / 1000)} seconds.`
      );
      error.retryAfterMs = retryMs;
      error.limiter = limiter;
      return Promise.reject(error);
    }

    return Promise.resolve(fn.apply(context, args));
  };
}