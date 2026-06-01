import { useState, useEffect, useCallback, useRef } from 'react';

const shallowEqualObject = (left = {}, right = {}) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => Object.is(left[key], right[key]));
};

/**
 * useFormValidation
 *
 * Generic form state + validation hook.
 *
 * @param {object}  initialState     - Initial field values keyed by field name
 * @param {object}  validationRules  - Validator per field: function(value, allValues) -> error string | null
 * @param {object}  [options]
 * @param {number}  [options.debounceMs=300]    - Debounce delay for inline validation on change
 * @param {boolean} [options.validateOnBlur=false] - When true, validation fires on blur only
 */
export const useFormValidation = (initialState, validationRules, options = {}) => {
  const { debounceMs = 300, validateOnBlur = false } = options;

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const timeoutRef = useRef(null);
  const mountedRef = useRef(false);
  const validationRunRef = useRef(0);
  const validationRulesRef = useRef(validationRules);
  const initialStateRef = useRef(initialState);
  const optionsRef = useRef({ debounceMs, validateOnBlur });

  const clearValidationTimer = useCallback(() => {
    validationRunRef.current += 1;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearValidationTimer();
    };
  }, [clearValidationTimer]);

  useEffect(() => {
    if (!shallowEqualObject(validationRulesRef.current, validationRules)) {
      clearValidationTimer();
    }
    validationRulesRef.current = validationRules;
  }, [validationRules, clearValidationTimer]);

  useEffect(() => {
    if (!shallowEqualObject(initialStateRef.current, initialState)) {
      clearValidationTimer();
    }
    initialStateRef.current = initialState;
  }, [initialState, clearValidationTimer]);

  useEffect(() => {
    optionsRef.current = { debounceMs, validateOnBlur };
    clearValidationTimer();
  }, [debounceMs, validateOnBlur, clearValidationTimer]);

  const validateField = useCallback((name, value, allValues) => {
    const validator = validationRulesRef.current[name];
    if (!validator) return null;

    if (typeof validator === 'function') {
      return validator(value, allValues);
    }

    if (typeof validator === 'object' && typeof validator.validate === 'function') {
      return validator.validate(value, allValues);
    }

    return null;
  }, []);

  const normalizeValidationResult = (result) => (result === true ? null : result);

  const scheduleFieldValidation = useCallback((name, value, nextValues) => {
    clearValidationTimer();

    const validationRun = validationRunRef.current + 1;
    validationRunRef.current = validationRun;

    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null;

      if (!mountedRef.current || validationRunRef.current !== validationRun) return;

      try {
        const error = normalizeValidationResult(
          await validateField(name, value, nextValues),
        );

        if (!mountedRef.current || validationRunRef.current !== validationRun) return;

        setErrors((prev) => ({ ...prev, [name]: error }));
      } catch (error) {
        if (!mountedRef.current || validationRunRef.current !== validationRun) return;

        setErrors((prev) => ({
          ...prev,
          [name]: error?.message || 'Validation failed',
        }));
      }
    }, optionsRef.current.debounceMs);
  }, [clearValidationTimer, validateField]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setValues((prev) => {
      const nextValues = { ...prev, [name]: value };

      if (validationRulesRef.current[name] && !optionsRef.current.validateOnBlur) {
        scheduleFieldValidation(name, value, nextValues);
      }

      return nextValues;
    });

    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  }, [scheduleFieldValidation]);

  const handleBlur = useCallback(async (e) => {
    if (!validationRulesRef.current[name]) return;
    if (optionsRef.current.validateOnBlur) return;

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
        }
        return prev;
      });
    }, optionsRef.current.debounceMs);
  }, [validateField, clearValidationTimer]);

  // Cancel the pending debounce timer when the hook unmounts to prevent
  // setState calls on an unmounted component.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Handle blur — run validation immediately without waiting for the debounce.
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (!validationRulesRef.current[name]) return;

    clearValidationTimer();
    const validationRun = validationRunRef.current;

    try {
      const error = normalizeValidationResult(
        await validateField(name, value, { ...values, [name]: value }),
      );

      if (!mountedRef.current || validationRunRef.current !== validationRun) return;
      setErrors((prev) => ({ ...prev, [name]: error }));
    } catch (error) {
      if (!mountedRef.current || validationRunRef.current !== validationRun) return;
      setErrors((prev) => ({
        ...prev,
        [name]: error?.message || 'Validation failed',
      }));
    }
  }, [clearValidationTimer, validateField, values]);

  const validateAll = useCallback(() => {
    clearValidationTimer();

    const newErrors = {};
    let isValid = true;

    Object.keys(validationRulesRef.current).forEach((name) => {
      const error = normalizeValidationResult(validateField(name, values[name], values));

      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    if (mountedRef.current) {
      setErrors(newErrors);
      setIsFormValid(isValid);
    }

    return isValid;
  }, [clearValidationTimer, validateField, values]);

  useEffect(() => {
    const hasErrors = Object.values(errors).some((error) => error !== null);
    const allRequiredFieldsSatisfied = Object.keys(validationRulesRef.current).every(
      (key) => touched[key] || values[key] !== '',
    );

    setIsFormValid(!hasErrors && allRequiredFieldsSatisfied);
  }, [errors, touched, values]);

  const resetForm = useCallback(() => {
    clearValidationTimer();
    setValues(initialStateRef.current);
    setErrors({});
    setTouched({});
    setIsFormValid(false);
  }, [clearValidationTimer]);

  return {
    values,
    errors,
    touched,
    isFormValid,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
  };
};

export default useFormValidation;
