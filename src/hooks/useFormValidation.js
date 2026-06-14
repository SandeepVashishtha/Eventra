import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useFormValidation
 *
 * Generic form state + validation hook.
 *
 * @param {object}  initialState     - Initial field values keyed by field name
 * @param {object}  validationRules  - Validator per field: function(value, allValues) → error string | null
 * @param {object}  [options]
 * @param {number}  [options.debounceMs=300]    - Debounce delay for inline validation on change
 * @param {boolean} [options.validateOnBlur=false] - When true, validation fires on blur only
 */
export const useFormValidation = (initialState, validationRules, options = {}) => {
  const { debounceMs = 300, validateOnBlur = false } = options;

  // Use a ref for the debounce timer so clearTimeout can reach it from
  // the cleanup effect regardless of which render created the timer.
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(false);
  const validationRunRef = useRef(0);

  // Keep the latest rule set and initial state in refs so callbacks that
  // close over them do not need to list them as dependencies — which would
  // cause handleChange / handleBlur to be recreated on every render.
  const validationRulesRef = useRef(validationRules);
  const initialStateRef = useRef(initialState);

  // Also keep validateOnBlur and debounceMs in a ref so handleChange
  // doesn't need them in its dependency array and is never recreated.
  const optionsRef = useRef({ debounceMs, validateOnBlur });

  useEffect(() => {
    validationRulesRef.current = validationRules;
  }, [validationRules]);

  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);

  useEffect(() => {
    optionsRef.current = { debounceMs, validateOnBlur };
  }, [debounceMs, validateOnBlur]);

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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
    };
  }, [clearValidationTimer]);

  useEffect(() => {
    return () => {
      clearValidationTimer();
    };
  }, [clearValidationTimer, debounceMs, validateOnBlur]);

  // Validate a single field
  // Validate a single field against its rule. Returns the error string or null.
  const validateField = useCallback((name, value, allValues) => {
    if (!validationRulesRef.current[name]) return null;
    const validator = validationRulesRef.current[name];
    let error;
    if (typeof validator === 'function') {
      error = validator(value, allValues);
    } else if (typeof validator === 'object' && validator.validate) {
      error = validator.validate(value, allValues);
    }
    return error === true ? null : error;
  }, []);

  // Validate all fields synchronously. Returns true when all pass.
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;
    Object.keys(validationRulesRef.current).forEach((name) => {
      const error = validateField(name, values[name], values);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, [values, validateField]);

  // Handle input change — clears the field error immediately for responsiveness
  // then schedules a debounced validation run. Uses optionsRef so this callback
  // is never recreated when debounceMs or validateOnBlur changes.
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: null }));

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

  // Cleanup handled by the unified clearValidationTimer effect above

  // Handle blur — run validation immediately without waiting for the debounce.
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (!validationRulesRef.current[name]) return;
    const error = validateField(name, value, values);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  // Derive overall form validity whenever field values, errors, or touch
  // state changes. A field is considered satisfied when it has been touched
  // OR when it already has a non-empty initial value.
  useEffect(() => {
    const hasErrors = Object.values(errors).some((error) => error !== null);
    const allRequiredFieldsSatisfied = Object.keys(validationRulesRef.current).every(
      (key) => touched[key] || values[key] !== '',
    );
    setIsFormValid(!hasErrors && allRequiredFieldsSatisfied);
  }, [errors, touched, values]);

  // Reset form to initial state and clear all validation state.
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
