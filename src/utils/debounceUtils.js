/**
 * Advanced Async Debounce & Throttle Engine
 *
 * Provides Promise-aware debouncing, throttling, keyed execution pools, 
 * AbortController integration, and leading/maxWait execution options.
 */

// ============================================================================
// 1. Error Classes & Type Guards
// ============================================================================

/**
 * Error thrown when a pending debounced or throttled async call is replaced or cancelled.
 */
export class DebounceCancelledError extends Error {
  /**
   * @param {string} [message="Debounced call cancelled"] - Error description message
   */
  constructor(message = "Debounced call cancelled") {
    super(message);
    this.name = "DebounceCancelledError";
    this.cancelled = true;
  }
}

/**
 * Detects cancellation errors produced by the debounce/throttle helpers.
 *
 * @param {unknown} error - Error or value to inspect.
 * @returns {boolean} Whether the value represents a cancelled debounced call.
 */
export const isDebounceCancelledError = (error) =>
  error instanceof DebounceCancelledError || error?.cancelled === true;

// ============================================================================
// 2. Core Async Debounce
// ============================================================================

/**
 * Debounces an async function and cancels the pending call when a newer invocation arrives.
 *
 * @param {Function} asyncFn - Primary async function to debounce.
 * @param {number} [delay=500] - Delay in milliseconds.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.resolveOnCancel=false] - Resolve instead of reject when a call is cancelled.
 * @param {*} [options.cancelledValue=undefined] - Value returned when `resolveOnCancel` is true.
 * @param {boolean} [options.leading=false] - Trigger on the leading edge of the delay.
 * @param {number} [options.maxWait] - Maximum time function is allowed to be delayed before execution.
 * @returns {Function} Debounced function decorated with `.cancel()`, `.flush()`, and `.isPending()`.
 */
export const debounceAsync = (asyncFn, delay = 500, options = {}) => {
  const {
    resolveOnCancel = false,
    cancelledValue = undefined,
    leading = false,
    maxWait = null,
  } = options;

  let timeoutId = null;
  let maxWaitTimeoutId = null;
  let pendingReject = null;
  let pendingResolve = null;
  let activeAbortController = null;
  let lastCallTime = null;
  let latestArgs = null;

  const cancelPending = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (maxWaitTimeoutId) {
      clearTimeout(maxWaitTimeoutId);
      maxWaitTimeoutId = null;
    }

    if (activeAbortController) {
      activeAbortController.abort(new DebounceCancelledError());
      activeAbortController = null;
    }

    if (pendingReject || pendingResolve) {
      const cancellation = new DebounceCancelledError();
      if (resolveOnCancel) {
        pendingResolve(cancelledValue);
      } else {
        pendingReject(cancellation);
      }
    }

    pendingReject = null;
    pendingResolve = null;
    lastCallTime = null;
  };

  const execute = async (args, resolve, reject) => {
    const controller = new AbortController();
    activeAbortController = controller;

    try {
      const result = await asyncFn(...args, { signal: controller.signal });

      if (activeAbortController === controller) {
        activeAbortController = null;
        if (pendingResolve === resolve) {
          pendingResolve = null;
          pendingReject = null;
        }
        resolve(result);
      }
    } catch (error) {
      if (activeAbortController === controller) {
        activeAbortController = null;
        if (pendingReject === reject) {
          pendingResolve = null;
          pendingReject = null;
        }
        reject(error);
      }
    }
  };

  const debounced = (...args) => {
    const isFirstCall = timeoutId === null;
    cancelPending();
    latestArgs = args;

    return new Promise((resolve, reject) => {
      pendingResolve = resolve;
      pendingReject = reject;
      lastCallTime = Date.now();

      if (leading && isFirstCall) {
        execute(latestArgs, resolve, reject);
        return;
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        execute(latestArgs, resolve, reject);
      }, delay);

      if (maxWait && !maxWaitTimeoutId) {
        maxWaitTimeoutId = setTimeout(() => {
          maxWaitTimeoutId = null;
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
            execute(latestArgs, pendingResolve, pendingReject);
          }
        }, maxWait);
      }
    });
  };

  debounced.cancel = cancelPending;

  debounced.flush = async (...args) => {
    cancelPending();
    return asyncFn(...args);
  };

  debounced.isPending = () => timeoutId !== null || activeAbortController !== null;

  return debounced;
};

// ============================================================================
// 3. Async Throttle Engine
// ============================================================================

/**
 * Throttles an async function so it executes at most once per specified duration window.
 *
 * @param {Function} asyncFn - Async function to throttle.
 * @param {number} [limit=500] - Throttle time limit in milliseconds.
 * @param {Object} [options]
 * @param {boolean} [options.leading=true] - Execute on leading edge.
 * @param {boolean} [options.trailing=true] - Execute on trailing edge.
 * @returns {Function} Throttled async function decorated with `.cancel()`.
 */
export const throttleAsync = (asyncFn, limit = 500, options = {}) => {
  const { leading = true, trailing = true } = options;

  let inThrottle = false;
  let lastResult = undefined;
  let lastArgs = null;
  let timeoutId = null;
  const pendingCallbacks = [];

  const settlePending = (error, result) => {
    while (pendingCallbacks.length > 0) {
      const { resolve, reject } = pendingCallbacks.shift();
      if (error) reject(error);
      else resolve(result);
    }
  };

  const throttled = async (...args) => {
    if (!inThrottle) {
      inThrottle = true;

      if (leading) {
        lastResult = await asyncFn(...args);
      } else {
        lastArgs = args;
        lastResult = undefined;
      }

      timeoutId = setTimeout(async () => {
        inThrottle = false;
        if (trailing && lastArgs) {
          const trailingArgs = lastArgs;
          lastArgs = null;
          try {
            lastResult = await asyncFn(...trailingArgs);
            settlePending(null, lastResult);
          } catch (error) {
            settlePending(error, null);
          }
        } else {
          settlePending(null, lastResult);
        }
      }, limit);

      return lastResult;
    }

    lastArgs = args;
    return new Promise((resolve, reject) => {
      pendingCallbacks.push({ resolve, reject });
    });
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    inThrottle = false;
    lastArgs = null;
    lastResult = null;
    settlePending(new DebounceCancelledError(), null);
  };

  return throttled;
};

// ============================================================================
// 4. Keyed Execution Pools & Domain Helpers
// ============================================================================

/**
 * Creates an isolated, keyed debounce pool where different keys (e.g. entity IDs)
 * are debounced independently of each other.
 *
 * @param {Function} asyncFn - Async worker function receiving (key, ...args).
 * @param {number} [delay=500] - Delay in milliseconds per key.
 * @returns {{ execute: Function, cancelKey: Function, clearAll: Function }} Keyed pool manager.
 */
export const createKeyedDebouncePool = (asyncFn, delay = 500) => {
  const pool = new Map();

  const getDebounced = (key) => {
    if (!pool.has(key)) {
      const fn = debounceAsync((...args) => asyncFn(key, ...args), delay);
      pool.set(key, fn);
    }
    return pool.get(key);
  };

  return {
    /**
     * Executes the debounced function for a specific key.
     */
    execute: (key, ...args) => getDebounced(key)(...args),

    /**
     * Cancels any pending debounced call for a specific key.
     */
    cancelKey: (key) => {
      if (pool.has(key)) {
        pool.get(key).cancel();
        pool.delete(key);
      }
    },

    /**
     * Cancels all pending debounced calls across all keys.
     */
    clearAll: () => {
      pool.forEach((fn) => fn.cancel());
      pool.clear();
    },
  };
};

/**
 * Creates a debounced validator that resolves cancelled calls as validation results.
 *
 * @param {Function} validator - Async validator function returning a result object.
 * @param {number} [delay=500] - Delay in milliseconds.
 * @returns {Function} Debounced validator with `.cancel()` and `.flush(...args)` helpers.
 */
export const createDebouncedValidator = (validator, delay = 500) =>
  debounceAsync(validator, delay, {
    resolveOnCancel: true,
    cancelledValue: {
      isValid: false,
      message: "Validation cancelled",
      cancelled: true,
    },
  });

export default debounceAsync;