/**
 * Error used when a pending debounced async call is replaced or cancelled.
 *
 * Consumers can check either `error instanceof DebounceCancelledError` or the
 * `cancelled` boolean for compatibility with serialized/custom errors.
 */
export class DebounceCancelledError extends Error {
  constructor(message = "Debounced call cancelled") {
    super(message);
    this.name = "DebounceCancelledError";
    this.cancelled = true;
  }
}

/**
 * Detects cancellation errors produced by the debounce helpers.
 *
 * @param {unknown} error - Error or value to inspect.
 * @returns {boolean} Whether the value represents a cancelled debounced call.
 */
export const isDebounceCancelledError = (error) =>
  error instanceof DebounceCancelledError || error?.cancelled === true;

/**
 * Debounces an async function and cancels the pending call when a newer value arrives.
 *
 * The wrapped function runs only after the user stops changing input for the
 * configured delay. By default, superseded calls reject with
 * `DebounceCancelledError`; set `resolveOnCancel` when cancellation should be a
 * normal resolved value instead.
 *
 * @param {Function} asyncFn - Async function to debounce.
 * @param {number} [delay=500] - Delay in milliseconds.
 * @param {Object} [options]
 * @param {boolean} [options.resolveOnCancel=false] - Resolve instead of reject when a call is cancelled.
 * @param {*} [options.cancelledValue] - Value returned for cancelled calls when `resolveOnCancel` is true.
 * @returns {Function} Debounced function with `.cancel()` and `.flush(...args)` helpers.
 *
 * @example
 * const search = debounceAsync(fetchSuggestions, 300);
 * search("eve").catch((error) => {
 *   if (!isDebounceCancelledError(error)) throw error;
 * });
 */
export const debounceAsync = (asyncFn, delay = 500, options = {}) => {
  const { resolveOnCancel = false, cancelledValue = undefined } = options;

  let timeoutId = null;
  let pendingReject = null;
  let pendingResolve = null;
  let activeAbortController = null;

  const cancelPending = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
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
  };

  const debounced = (...args) => {
    cancelPending();

    return new Promise((resolve, reject) => {
      pendingResolve = resolve;
      pendingReject = reject;

      timeoutId = setTimeout(async () => {
        timeoutId = null;

        const currentResolve = pendingResolve;
        const currentReject = pendingReject;

        const controller = new AbortController();
        activeAbortController = controller;

        try {
          // Pass signal as an extra argument so callers can wire it up to fetch()
          const result = await asyncFn(...args, { signal: controller.signal });

          if (activeAbortController === controller) {
            activeAbortController = null;
            if (pendingResolve === currentResolve) {
              pendingResolve = null;
              pendingReject = null;
            }
            currentResolve(result);
          }
        } catch (error) {
          if (activeAbortController === controller) {
            activeAbortController = null;
            if (pendingReject === currentReject) {
              pendingResolve = null;
              pendingReject = null;
            }
            currentReject(error);
          }
        }
      }, delay);
    });
  };

  debounced.cancel = cancelPending;

  debounced.flush = async (...args) => {
    cancelPending();
    return asyncFn(...args);
  };

  return debounced;
};

/**
 * Creates a debounced validator that resolves cancelled calls as validation results.
 *
 * This is useful for form fields because typing a newer value should not surface
 * a rejected promise as an error. Superseded calls resolve to
 * `{ isValid: false, message: "Validation cancelled", cancelled: true }`.
 *
 * @param {Function} validator - Async validator returning a standardized validation result.
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
