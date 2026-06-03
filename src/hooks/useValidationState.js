/**
 * Helper hook for managing validation state in forms
 * Works alongside useFormValidation hook for enhanced validation UX
 */
import { useCallback, useMemo } from "react";

/**
 * Hook to determine validation status based on field state
 * Returns human-readable status and visual indicators
 *
 * @param {string} fieldName - Field name
 * @param {string} validationState - Current validation state ('idle' | 'validating' | 'success' | 'error')
 * @param {string|null} error - Field error message
 * @param {boolean} touched - Whether field has been touched
 *
 * @returns {Object} Validation status info
 */
export const useValidationState = (
  fieldName,
  validationState = "idle",
  error = null,
  touched = false,
) => {
  /**
   * Get visual indicator based on validation state
   * 🔥 FIX: Converted from invoked useCallback to useMemo for proper computed caching
   */
  const statusIndicator = useMemo(() => {
    switch (validationState) {
      case "validating":
        return "validating"; // Show spinner
      case "success":
        return "success"; // Show checkmark
      case "error":
        return "error"; // Show error icon
      default:
        return "idle"; // No indicator
    }
  }, [validationState]);

  /**
   * Get status message for accessibility announcements
   */
  const statusMessage = useMemo(() => {
    switch (validationState) {
      case "validating":
        return `${fieldName} is being validated`;
      case "success":
        return `${fieldName} is valid`;
      case "error":
        return `${fieldName} has an error: ${error || "Invalid input"}`;
      default:
        return "";
    }
  }, [fieldName, error, validationState]);

  /**
   * Check if field should show error message
   */
  const shouldShowError = useMemo(() => {
    return touched && validationState === "error" && error;
  }, [touched, validationState, error]);

  /**
   * Check if validation is in progress
   */
  const isValidating = useMemo(() => {
    return validationState === "validating";
  }, [validationState]);

  /**
   * Check if validation passed
   */
  const isValid = useMemo(() => {
    return validationState === "success";
  }, [validationState]);

  /**
   * Get CSS classes for styling based on validation state
   * (Kept as useCallback because it accepts an argument and is executed by the consumer)
   */
  const getFieldClassName = useCallback(
    (baseClass = "") => {
      let classes = baseClass;

      if (!touched) {
        return classes;
      }

      switch (validationState) {
        case "success":
          return `${classes} border-green-500 dark:border-green-400`;
        case "error":
          return `${classes} border-red-500 dark:border-red-400`;
        case "validating":
          return `${classes} border-blue-500 dark:border-blue-400`;
        default:
          return classes;
      }
    },
    [touched, validationState],
  );

  /**
   * Get ARIA attributes for accessibility
   * 🔥 FIX: useMemo prevents returning a new object reference on every render, fixing massive form re-renders.
   */
  const ariaAttributes = useMemo(() => {
    const attributes = {};

    if (error && touched) {
      attributes["aria-invalid"] = "true";
      attributes["aria-describedby"] = `${fieldName}-error`;
    } else {
      attributes["aria-invalid"] = "false";
    }

    if (validationState === "validating") {
      attributes["aria-busy"] = "true";
    }

    if (isValid) {
      attributes["aria-describedby"] = `${fieldName}-success`;
    }

    return attributes;
  }, [fieldName, error, touched, validationState, isValid]);

  return {
    // Status checks
    statusIndicator,
    statusMessage,
    shouldShowError,
    isValidating,
    isValid,

    // Styling
    fieldClassName: getFieldClassName,
    ariaAttributes,

    // Direct accessors
    validationState,
    touched,
    error,
  };
};

export default useValidationState;
