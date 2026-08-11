import { useState, useCallback, useRef } from 'react';

/**
 * useAsyncValidation
 *
 * Wraps async server-side validators (e.g. "is this email already taken?")
 * with proper loading state, AbortController-based cancellation, and
 * debouncing so rapid keystrokes don't fire a request per character.
 *
 * Works standalone or alongside useFormValidation by feeding its
 * asyncErrors back into the parent's errors object.
 *
 * @param {object} asyncValidators
 *   Map of field name → async function(value, signal) → error string | null
 *   The function receives an AbortSignal so it can cancel in-flight requests.
 *
 * @param {object} [options]
 * @param {number} [options.debounceMs=500]  Debounce delay before firing
 *
 * @example
 * const { asyncErrors, asyncTouched, isAsyncValidating, validateAsync } =
 *   useAsyncValidation({
 *     email: async (value, signal) => {
 *       const res = await apiUtils.post(API_ENDPOINTS.AUTH.CHECK_EMAIL,
 *         { email: value }, { signal });
 *       return res.data?.exists ? 'This email is already registered.' : null;
 *     },
 *   });
 */
const useAsyncValidation = (asyncValidators = {}, options = {}) => {
  const { debounceMs = 500 } = options;

  const [asyncErrors, setAsyncErrors]           = useState({});
  const [asyncTouched, setAsyncTouched]         = useState({});
  const [isAsyncValidating, setIsAsyncValidating] = useState({});

  // One AbortController per field — cancels the previous in-flight request
  // whenever a new keystroke arrives for the same field.
  const abortControllersRef = useRef({});

  // One debounce timer per field
  const timersRef = useRef({});

  // Track whether the hook is still mounted
  const isMountedRef = useRef(true);
  // Note: isMountedRef is set to false in cleanup via the returned cleanup fn.
  // Callers should call the returned cleanup in their useEffect return.

  /**
   * validateAsync(name, value)
   *
   * Debounces and then runs the async validator for `name`.
   * Safe to call on every keystroke — earlier calls are cancelled.
   *
   * @param {string} name   Field name
   * @param {string} value  Current field value
   */
  const validateAsync = useCallback((name, value) => {
    if (!asyncValidators[name]) return;

    // Cancel previous debounce timer for this field
    if (timersRef.current[name]) {
      clearTimeout(timersRef.current[name]);
    }

    // Abort any in-flight request for this field
    if (abortControllersRef.current[name]) {
      abortControllersRef.current[name].abort();
    }

    // Show loading state immediately so the UI is responsive
    setIsAsyncValidating((prev) => ({ ...prev, [name]: true }));
    setAsyncErrors((prev) => ({ ...prev, [name]: null }));

    timersRef.current[name] = setTimeout(async () => {
      timersRef.current[name] = null;

      const controller = new AbortController();
      abortControllersRef.current[name] = controller;

      try {
        const error = await asyncValidators[name](value, controller.signal);

        // Only update state if not aborted and still mounted
        if (!controller.signal.aborted && isMountedRef.current) {
          setAsyncErrors((prev) => ({ ...prev, [name]: error ?? null }));
          setAsyncTouched((prev) => ({ ...prev, [name]: true }));
        }
      } catch (err) {
        // Ignore AbortError — it means a newer request superseded this one
        if (err?.name !== 'AbortError' && isMountedRef.current) {
          setAsyncErrors((prev) => ({
            ...prev,
            [name]: 'Could not validate this field. Please try again.',
          }));
        }
      } finally {
        if (isMountedRef.current && !controller.signal.aborted) {
          setIsAsyncValidating((prev) => ({ ...prev, [name]: false }));
        }
      }
    }, debounceMs);
  }, [asyncValidators, debounceMs]);

  /**
   * clearAsyncError(name)
   * Clears the async error for a specific field — call this when the field
   * value is reset or when the form is submitted successfully.
   */
  const clearAsyncError = useCallback((name) => {
    setAsyncErrors((prev) => ({ ...prev, [name]: null }));
    setAsyncTouched((prev) => ({ ...prev, [name]: false }));
    setIsAsyncValidating((prev) => ({ ...prev, [name]: false }));
  }, []);

  /**
   * cleanup()
   * Aborts all in-flight requests and clears all timers.
   * Call this in your useEffect cleanup:
   *   useEffect(() => { return cleanup; }, []);
   */
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    Object.values(timersRef.current).forEach(clearTimeout);
    Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    timersRef.current = {};
    abortControllersRef.current = {};
  }, []);

  /**
   * hasAsyncErrors — true if any field currently has an async error
   */
  const hasAsyncErrors = Object.values(asyncErrors).some(Boolean);

  /**
   * isAnyAsyncValidating — true if any field is currently running an async check
   */
  const isAnyAsyncValidating = Object.values(isAsyncValidating).some(Boolean);

  return {
    asyncErrors,
    asyncTouched,
    isAsyncValidating,
    isAnyAsyncValidating,
    hasAsyncErrors,
    validateAsync,
    clearAsyncError,
    cleanup,
  };
};

export default useAsyncValidation;
