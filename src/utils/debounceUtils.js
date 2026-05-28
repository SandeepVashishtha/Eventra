export class DebounceCancelledError extends Error {
  constructor(message = "Debounced call cancelled") {
    super(message);
    this.name = "DebounceCancelledError";
    this.cancelled = true;
  }
}

export const isDebounceCancelledError = (error) =>
  error instanceof DebounceCancelledError || error?.cancelled === true;

/**
 * Debounce an async function and cancel any pending call when a newer value
 * arrives. The wrapped function runs only after the user stops changing input.
 */
export const debounceAsync = (asyncFn, delay = 500, options = {}) => {
  const {
    resolveOnCancel = false,
    cancelledValue = undefined,
  } = options;

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
 * Convenience wrapper for validators that return standardized validation
 * results. Superseded calls resolve as cancelled results instead of rejecting.
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
