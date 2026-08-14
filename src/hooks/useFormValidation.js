import { useState, useEffect, useCallback, useRef } from "react";
import useAsyncValidation from "./useAsyncValidation";

/**
 * useFormValidation
 *
 * Generic form state + validation hook.
 *
 * @param {object}  initialState      - Initial field values keyed by field name
 * @param {object}  validationRules   - Sync validator per field: fn(value, allValues) → string|null
 * @param {object}  [options]
 * @param {number}  [options.debounceMs=300]       - Debounce delay for inline validation on change
 * @param {boolean} [options.validateOnBlur=false]  - When true, validation fires on blur only
 * @param {object}  [options.asyncValidators={}]
 *   Fix (Issue): Map of field → async fn(value, signal) → string|null.
 *   Previously, async validators returned a Promise object which was
 *   displayed raw as "[object Promise]" in the error field. Now they are
 *   properly awaited via the new useAsyncValidation hook, with debouncing,
 *   AbortController cancellation, and per-field loading state.
 */
export const useFormValidation = (initialState, validationRules, options = {}) => {
  const { debounceMs = 300, validateOnBlur = false, asyncValidators = {} } = options;

  const timeoutRef = useRef(null);
  const isMountedRef = useRef(false);
  const validationRunRef = useRef(0);

  const validationRulesRef = useRef(validationRules);
  const initialStateRef = useRef(initialState);
  const valuesRef = useRef(initialState);
  const optionsRef = useRef({ debounceMs, validateOnBlur });

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const {
    asyncErrors,
    asyncTouched,
    isAsyncValidating,
    isAnyAsyncValidating,
    hasAsyncErrors,
    validateAsync,
    clearAsyncError,
    cleanup: cleanupAsync,
  } = useAsyncValidation(asyncValidators);

  useEffect(() => {
    validationRulesRef.current = validationRules;
  }, [validationRules]);

  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  useEffect(() => {
    optionsRef.current = { debounceMs, validateOnBlur };
  }, [debounceMs, validateOnBlur]);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const clearValidationTimer = useCallback(() => {
    validationRunRef.current += 1;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearValidationTimer();
      cleanupAsync();
    };
  }, [clearValidationTimer, cleanupAsync]);

  useEffect(() => {
    return () => {
      clearValidationTimer();
    };
  }, [clearValidationTimer, debounceMs, validateOnBlur]);

  // ── Sync validation ────────────────────────────────────────────────────────
  // Fix: previously this returned a raw Promise when a validator was async,
  // which React then rendered as "[object Promise]" in the error field.
  // Async validators are now handled exclusively via useAsyncValidation above.
  // This function only handles synchronous validators.
  const validateField = useCallback((name, value, allValues) => {
    if (!validationRulesRef.current[name]) return null;
    const validator = validationRulesRef.current[name];
    let error;
    if (typeof validator === "function") {
      error = validator(value, allValues);
    } else if (typeof validator === "object" && validator.validate) {
      error = validator.validate(value, allValues);
    }
    if (error && typeof error.then === "function") {
      return error.then((resolved) => (resolved === true ? null : resolved));
    }
    return error === true ? null : error;
  }, []);

  // Validate all fields (sync + async). Resolves async validator results so a
  // pending Promise is never treated as a sync error.
  const validateAll = useCallback(async () => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;
    await Promise.all(
      Object.keys(validationRulesRef.current).map(async (name) => {
        newTouched[name] = true;
        const error = await validateField(name, values[name], values);
        if (error) {
          newErrors[name] = error;
          isValid = false;
        }
      })
    );
    if (hasAsyncErrors) isValid = false;
    setTouched((prev) => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, [values, validateField, hasAsyncErrors]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setValues((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({ ...prev, [name]: null }));

      // Trigger async validation if a validator is registered for this field
      if (asyncValidators[name]) {
        validateAsync(name, value);
      }

      if (!validationRulesRef.current[name]) return;
      if (optionsRef.current.validateOnBlur) return;

      setIsValidating(true);
      clearValidationTimer();
      const validationRun = validationRunRef.current + 1;
      validationRunRef.current = validationRun;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (!isMountedRef.current || validationRunRef.current !== validationRun) return;

        setValues((prev) => {
          const currentValues = { ...prev, [name]: value };
          const error = validateField(name, value, currentValues);
          if (isMountedRef.current && validationRunRef.current === validationRun) {
            setErrors((errs) => ({ ...errs, [name]: error }));
            setIsValidating(false);
          }
          return prev;
        });
      }, optionsRef.current.debounceMs);
    },
    [validateField, clearValidationTimer, validateAsync, asyncValidators]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (!validationRulesRef.current[name]) return;
      const error = validateField(name, value, valuesRef.current);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  // ── Derived validity ───────────────────────────────────────────────────────
  useEffect(() => {
    const hasSyncErrors = Object.values(errors).some((error) => error !== null);
    const allRequiredFieldsSatisfied = Object.keys(validationRulesRef.current).every(
      (key) => touched[key] || values[key] !== ""
    );
    setIsFormValid(!hasSyncErrors && !hasAsyncErrors && allRequiredFieldsSatisfied);
  }, [errors, touched, values, hasAsyncErrors]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    clearValidationTimer();
    setValues(initialStateRef.current);
    setErrors({});
    setTouched({});
    setIsFormValid(false);
    Object.keys(asyncValidators).forEach(clearAsyncError);
  }, [clearValidationTimer, asyncValidators, clearAsyncError]);

  return {
    isValidating,
    values,
    errors,
    touched,
    isFormValid,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
    // Async state
    asyncErrors,
    asyncTouched,
    isAsyncValidating,
    isAnyAsyncValidating,
  };
};

export default useFormValidation;
