/**
 * api/_lib/concurrency.js
 *
 * Safe concurrency limiter that prevents race conditions under rapid task scheduling.
 */

/**
 * ConcurrencyLimiter class.
 * Safely limits the number of concurrent asynchronous operations.
 * Resolves the microtask queue race condition by reserving slots synchronously.
 */
export class ConcurrencyLimiter {
  /**
   * @param {number} concurrency - Maximum number of concurrent operations.
   */
  constructor(concurrency) {
    if (typeof concurrency !== "number" || concurrency < 1) {
      throw new Error("Concurrency must be a number and at least 1");
    }
    this.concurrency = concurrency;
    this.queue = [];
    this.activeCount = 0;
  }

  /**
   * Run an asynchronous function within the concurrency limit.
   * @param {Function} fn - Async function to run
   * @returns {Promise<any>} Resolves with the result of fn
   */
  async run(fn) {
    if (typeof fn !== "function") {
      throw new TypeError("Callback must be a function");
    }

    if (this.activeCount >= this.concurrency) {
      await new Promise((resolve) => {
        this.queue.push(resolve);
      });
    } else {
      this.activeCount++;
    }

    try {
      return await fn();
    } finally {
      this._next();
    }
  }

  /**
   * Process the next task in the queue or decrement the active count.
   * @private
   */
  _next() {
    if (this.queue.length > 0) {
      const entry = this.queue.shift();
      // Resolve the queued promise. The slot remains occupied,
      // so activeCount is NOT decremented.
      entry();
    } else {
      this.activeCount--;
    }
  }
}

/**
 * Creates a concurrency limiter object.
 * @param {number} concurrency 
 * @returns {{ run: (fn: Function) => Promise<any> }}
 */
export function createConcurrencyLimiter(concurrency) {
  const limiter = new ConcurrencyLimiter(concurrency);
  return {
    run: (fn) => limiter.run(fn)
  };
}

/**
 * Runs all functions with a concurrency limit.
 * @param {number} limit 
 * @param {Function[]} fns 
 * @returns {Promise<any[]>}
 */
export async function runAll(limit, fns) {
  if (!Array.isArray(fns) || fns.length === 0) {
    return [];
  }
  const limiter = new ConcurrencyLimiter(limit);
  return Promise.all(fns.map((fn) => limiter.run(fn)));
}
