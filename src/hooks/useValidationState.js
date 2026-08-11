/**
 * Helper hook for managing validation state in forms
 * Works alongside useFormValidation hook for enhanced validation UX
 */
import { useCallback } from "react";

/**
 * Hook to determine validation status based on field state
 * Returns human-readable status and visual indicators
 *
 * Supports both options object signature and positional parameters:
 * e.g. useValidationState({ fieldName, validationState, error, touched, messages })
 * e.g. useValidationState(fieldName, validationState, error, touched, messages)
 *
 * @param {string|Object} fieldNameOrOptions - Field name string or options object
 * @param {string} [validationStateArg="idle"] - Current validation state ('idle' | 'validating' | 'success' | 'error')
 * @param {string|null} [errorArg=null] - Field error message
 * @param {boolean} [touchedArg=false] - Whether field has been touched
 * @param {Object} [messagesArg={}] - Custom message template strings or formatter functions for i18n
 *
 * @returns {Object} Validation status info
 */
export const useValidationState = (
  fieldNameOrOptions,
  validationStateArg = "idle",
  errorArg = null,
  touchedArg = false,
  messagesArg = {},
) => {
  // Normalize arguments for both object and positional parameter signatures
  const isOptionsObject =
    typeof fieldNameOrOptions === "object" && fieldNameOrOptions !== null;

  const fieldName = isOptionsObject
    ? fieldNameOrOptions.fieldName
    : fieldNameOrOptions;
  const validationState = isOptionsObject
    ? fieldNameOrOptions.validationState ?? "idle"
    : validationStateArg;
  const error = isOptionsObject
    ? fieldNameOrOptions.error ?? null
    : errorArg;
  const touched = isOptionsObject
    ? fieldNameOrOptions.touched ?? false
    : touchedArg;
  const messages = isOptionsObject
    ? fieldNameOrOptions.messages ?? {}
    : messagesArg;

  /**
   * Get visual indicator based on validation state
   */
  const getStatusIndicator = useCallback(() => {
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
   * Get status message for accessibility announcements and UI display.
   * Resolves custom string templates or i18n formatter functions if provided in `messages`.
   */
  const getStatusMessage = useCallback(() => {
    const customMessage = messages?.[validationState];

    if (typeof customMessage === "function") {
      return customMessage(fieldName, error);
    }

    if (typeof customMessage === "string") {
      return customMessage;
    }

    // Default fallback messages
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
  }, [fieldName, error, validationState, messages]);

  /**
   * Check if field should show error message
   */
  const shouldShowError = useCallback(() => {
    return touched && validationState === "error" && Boolean(error);
  }, [touched, validationState, error]);

  /**
   * Check if validation is in progress
   */
  const isValidating = useCallback(() => {
    return validationState === "validating";
  }, [validationState]);

  /**
   * Check if validation passed
   */
  const isValid = useCallback(() => {
    return validationState === "success";
  }, [validationState]);

  /**
   * Get CSS classes for styling based on validation state
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
   */
  const getAriaAttributes = useCallback(() => {
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

    if (isValid()) {
      attributes["aria-describedby"] = `${fieldName}-success`;
    }

    return attributes;
  }, [fieldName, error, touched, validationState, isValid]);

  return {
    // Status checks
    statusIndicator: getStatusIndicator(),
    statusMessage: getStatusMessage(),
    shouldShowError: shouldShowError(),
    isValidating: isValidating(),
    isValid: isValid(),

    // Styling
    fieldClassName: getFieldClassName,
    ariaAttributes: getAriaAttributes(),

    // Direct accessors
    validationState,
    touched,
    error,
  };
};

export default useValidationState;