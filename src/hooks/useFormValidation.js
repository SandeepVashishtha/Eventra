import { useState, useEffect, useCallback, useRef } from 'react';

export const useFormValidation = (initialState, validationRules, options = {}) => {
  const { debounceMs = 300, validateOnBlur = false } = options;
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(false);
  const validationRunRef = useRef(0);
  const validationRulesRef = useRef(validationRules);
  const initialStateRef = useRef(initialState);

  useEffect(() => {
    validationRulesRef.current = validationRules;
  }, [validationRules]);

  useEffect(() => {
    initialStateRef.current = initialState;
  }, [initialState]);
  
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

  // Validate all fields
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

  // Handle input change — just updates state, debounced validation is in useEffect
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));

    setTouched(prev => ({ ...prev, [name]: true }));

    setErrors(prev => ({ ...prev, [name]: null }));

    if (validationRulesRef.current[name] && !validateOnBlur) {
      clearValidationTimer();
      const validationRun = validationRunRef.current + 1;
      validationRunRef.current = validationRun;

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        if (!isMountedRef.current || validationRunRef.current !== validationRun) return;

        const error = validateField(name, value, { ...values, [name]: value });
        if (!isMountedRef.current || validationRunRef.current !== validationRun) return;

        setErrors(prev => ({ ...prev, [name]: error }));
      }, debounceMs);
    }
  }, [validateOnBlur, debounceMs, validateField, values, clearValidationTimer]);

  // Handle blur for validation
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validationRulesRef.current[name]) {
      const error = validateField(name, value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, values]);

  // Update form validity when values or errors change
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== null);
    const allRequiredFieldsTouched = Object.keys(validationRulesRef.current).every(
      key => touched[key] || values[key] !== ''
    );

    setIsFormValid(!hasErrors && allRequiredFieldsTouched);
  }, [errors, touched, values]);

  // Reset form
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
