import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Enhanced form validation hook with async validator support
 *
 * @param {Object} initialState - Initial form values
 * @param {Object} validationRules - Validation rules (sync or async functions)
 * @param {Object} options - Configuration options
 * @param {number} [options.debounceMs=300] - Debounce delay for async validators
 * @param {boolean} [options.validateOnBlur=false] - Validate on field blur
 * @param {number} [options.asyncValidationTimeout=10000] - Async validation timeout
 * @param {boolean} [options.cacheResults=true] - Cache validation results
 *
 * @returns {Object} Form state and handlers
 * @returns {Object} values - Current form values
 * @returns {Object} errors - Field errors
 * @returns {Object} touched - Touched field tracking
 * @returns {Object} validationState - Validation state per field ('idle', 'validating', 'success', 'error')
 * @returns {boolean} isFormValid - Whether entire form is valid
 * @returns {Function} handleChange - Input change handler
 * @returns {Function} handleBlur - Input blur handler
 * @returns {Function} validateField - Validate single field
 * @returns {Function} validateAll - Validate all fields
 * @returns {Function} resetForm - Reset form to initial state
 * @returns {Function} setFieldValue - Programmatically set field value
 * @returns {Function} setFieldError - Programmatically set field error
 */
export const useFormValidation = (
  initialState,
  validationRules,
  options = {},
) => {
  const {
    debounceMs = 300,
    validateOnBlur = false,
    asyncValidationTimeout = 10000,
    cacheResults = true,
  } = options;

  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({}); // 'idle' | 'validating' | 'success' | 'error'
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for debouncing and caching
  const timeoutRefs = useRef({});
  const validationCacheRef = useRef({});

  /**
   * Clear debounce timeout for a field
   */
  const clearFieldTimeout = useCallback((fieldName) => {
    if (timeoutRefs.current[fieldName]) {
      clearTimeout(timeoutRefs.current[fieldName]);
      delete timeoutRefs.current[fieldName];
    }
  }, []);

  /**
   * Check if a validator is async (returns promise)
   */
  const isAsyncValidator = useCallback((validator) => {
    if (typeof validator === "function") {
      return validator.constructor.name === "AsyncFunction";
    }
    return false;
  }, []);

  /**
   * Validate a single field with async support
   */
  const validateField = useCallback(
    async (fieldName, value, allValues) => {
      if (!validationRules[fieldName]) {
        setValidationState((prev) => ({
          ...prev,
          [fieldName]: "idle",
        }));
        return null;
      }

      const validators = Array.isArray(validationRules[fieldName])
        ? validationRules[fieldName]
        : [validationRules[fieldName]];

      // Check cache first if enabled
      const cacheKey = `${fieldName}:${value}`;
      if (cacheResults && validationCacheRef.current[cacheKey]) {
        return validationCacheRef.current[cacheKey];
      }

      let finalError = null;

      // Run through all validators (sync first, then async)
      for (const validator of validators) {
        try {
          let error;

          if (isAsyncValidator(validator)) {
            // Async validator
            setValidationState((prev) => ({
              ...prev,
              [fieldName]: "validating",
            }));

            // Wrap in timeout promise
            const validationPromise = Promise.race([
              validator(value, allValues),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Validation timeout")),
                  asyncValidationTimeout,
                ),
              ),
            ]);

            error = await validationPromise;
          } else if (typeof validator === "function") {
            // Sync validator
            error = validator(value, allValues);
          } else if (typeof validator === "object" && validator.validate) {
            // Object-based validator
            if (validator.async) {
              setValidationState((prev) => ({
                ...prev,
                [fieldName]: "validating",
              }));
              const validationPromise = Promise.race([
                validator.validate(value, allValues),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error("Validation timeout")),
                    asyncValidationTimeout,
                  ),
                ),
              ]);
              error = await validationPromise;
            } else {
              error = validator.validate(value, allValues);
            }
          }

          // Convert error to string or null
          finalError = error === true ? null : error || null;

          if (finalError) break; // Stop at first error
        } catch (err) {
          finalError = err.message || "Validation error";
          setValidationState((prev) => ({
            ...prev,
            [fieldName]: "error",
          }));
          break;
        }
      }

      // Update validation state
      if (!finalError) {
        setValidationState((prev) => ({
          ...prev,
          [fieldName]: "success",
        }));
      } else {
        setValidationState((prev) => ({
          ...prev,
          [fieldName]: "error",
        }));
      }

      // Cache the result
      if (cacheResults) {
        validationCacheRef.current[cacheKey] = finalError;
      }

      return finalError;
    },
    [validationRules, isAsyncValidator, asyncValidationTimeout, cacheResults],
  );

  /**
   * Handle input change with debounced validation
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      // Update value immediately
      setValues((prev) => ({ ...prev, [name]: fieldValue }));
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Clear previous validation error immediately for better UX
      setErrors((prev) => ({ ...prev, [name]: null }));

      // Clear previous timeout for this field
      clearFieldTimeout(name);

      // Debounced validation
      if (validationRules[name]) {
        timeoutRefs.current[name] = setTimeout(async () => {
          const error = await validateField(name, fieldValue, {
            ...values,
            [name]: fieldValue,
          });
          setErrors((prev) => ({ ...prev, [name]: error }));
        }, debounceMs);
      }
    },
    [validationRules, values, validateField, debounceMs, clearFieldTimeout],
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    async (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validationRules[name] && validateOnBlur) {
        const error = await validateField(name, value, values);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validationRules, values, validateField, validateOnBlur],
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback(async () => {
    const newErrors = {};
    let isValid = true;

    const validationPromises = Object.keys(validationRules).map(
      async (fieldName) => {
        const error = await validateField(fieldName, values[fieldName], values);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
        return error;
      },
    );

    await Promise.all(validationPromises);

    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, [values, validationRules, validateField]);

  /**
   * Programmatically set field value
   */
  const setFieldValue = useCallback(
    (fieldName, value) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      clearFieldTimeout(fieldName);
    },
    [clearFieldTimeout],
  );

  /**
   * Programmatically set field error
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setValidationState({});
    setIsFormValid(false);

    // Clear all pending timeouts
    Object.keys(timeoutRefs.current).forEach((fieldName) => {
      clearFieldTimeout(fieldName);
    });
  }, [initialState, clearFieldTimeout]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const isValid = await validateAll();
        if (isValid) {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateAll, values],
  );

  /**
   * Update form validity whenever errors change
   */
  useEffect(() => {
    const hasErrors = Object.values(errors).some((error) => error !== null);
    const hasAsyncValidating = Object.values(validationState).some(
      (state) => state === "validating",
    );
    const allFieldsTouched = Object.keys(validationRules).every(
      (key) => touched[key] || values[key] !== "",
    );

    setIsFormValid(!hasErrors && !hasAsyncValidating && allFieldsTouched);
  }, [errors, touched, values, validationRules, validationState]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      Object.keys(timeoutRefs.current).forEach((fieldName) => {
        clearFieldTimeout(fieldName);
      });
    };
  }, [clearFieldTimeout]);

  return {
    // Form state
    values,
    errors,
    touched,
    validationState,
    isFormValid,
    isSubmitting,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Methods
    validateField,
    validateAll,
    resetForm,
    setFieldValue,
    setFieldError,

    // Utilities
    clearFieldTimeout,
  };
};

export default useFormValidation;
