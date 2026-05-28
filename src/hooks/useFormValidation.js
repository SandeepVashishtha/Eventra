import { useState, useEffect, useCallback, useRef } from 'react';

export const useFormValidation = (initialState, validationRules, options = {}) => {
  const { debounceMs = 300, validateOnBlur = false } = options;

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const debounceTimerRef = useRef(null);

  // Validate a single field
  const validateField = useCallback((name, value, allValues) => {
    if (!validationRules[name]) return null;

    const validator = validationRules[name];
    let error;

    if (typeof validator === 'function') {
      error = validator(value, allValues);
    } else if (typeof validator === 'object' && validator.validate) {
      error = validator.validate(value, allValues);
    }

    return error === true ? null : error;
  }, [validationRules]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name], values);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, [values, validationRules, validateField]);

  // Handle input change — just updates state, debounced validation is in useEffect
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  // Debounced validation effect — watches values, cancels/restarts timer on each change
  useEffect(() => {
    if (validateOnBlur) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const newErrors = {};
      Object.keys(validationRules).forEach((name) => {
        if (touched[name] || values[name] !== '') {
          const error = validateField(name, values[name], values);
          if (error) newErrors[name] = error;
        }
      });
      setErrors(prev => {
        const merged = { ...prev };
        Object.keys(newErrors).forEach(field => {
          if (newErrors[field]) {
            merged[field] = newErrors[field];
          } else {
            delete merged[field];
          }
        });
        return merged;
      });
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [values, validationRules, validateField, debounceMs, validateOnBlur, touched]);

  // Handle blur for validation
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (validationRules[name]) {
      const error = validateField(name, value, values);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validationRules, validateField, values]);

  // Update form validity when values or errors change
  useEffect(() => {
    const hasErrors = Object.values(errors).some(error => error !== null);
    const allRequiredFieldsTouched = Object.keys(validationRules).every(
      key => touched[key] || values[key] !== ''
    );

    setIsFormValid(!hasErrors && allRequiredFieldsTouched);
  }, [errors, touched, values, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsFormValid(false);
  }, [initialState]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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