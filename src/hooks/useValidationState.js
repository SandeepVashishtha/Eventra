/**
 * Helper hook for managing validation state in forms
 * Works alongside useFormValidation hook for enhanced validation UX
 */
import { useCallback, useMemo } from "react";

/**
 * Custom React hook to compute visual states, accessibility attributes, and CSS class names
 * based on the validation lifecycle of a form field.
 *
 * ### Purpose
 * Standardizes form field validation feedback across the application. It decouples the visual
 * representation and accessibility characteristics of form inputs from the core validation logic.
 *
 * ### State & Styling Transitions
 * - **Un-touched Field**: If `touched` is false, styling class names returned via `fieldClassName`
 *   remain unchanged (base classes only). This prevents showing validation states (success/error)
 *   prematurely to the user before they interact with the field.
 * - **Touched & Success**: Once the field is interacted with and `validationState` becomes `'success'`,
 *   green border classes are appended.
 * - **Touched & Error**: Appends red border classes and signals that error messages (`shouldShowError`)
 *   should be rendered.
 * - **Validating**: Appends blue border classes, representing asynchronous validation in progress.
 *
 * ### Accessibility (A11y) Integration
 * Automatically generates appropriate ARIA attributes (`ariaAttributes`) and status messages (`statusMessage`)
 * to guide screen reader users through the form validation process:
 * - `aria-invalid="true"` and `aria-describedby="{fieldName}-error"` are set during errors.
 * - `aria-busy="true"` is set when validation is in progress.
 * - `aria-describedby="{fieldName}-success"` is set upon successful validation.
 *
 * ### Performance Optimization
 * Computations are heavily memoized using `useMemo` and `useCallback`. The returned `ariaAttributes`
 * and boolean flags preserve reference equality across renders, preventing unnecessary re-renders of
 * consumer input components.
 *
 * @param {string} fieldName - The unique name or identifier of the form field (e.g., 'email', 'password'). Used to generate accessibility labels and ARIA IDs.
 * @param {string} [validationState='idle'] - The current state in the validation lifecycle. Must be one of:
 *   - `'idle'`: No active validation state.
 *   - `'validating'`: Async validation is in progress.
 *   - `'success'`: The field passed all validation rules.
 *   - `'error'`: The field failed validation.
 * @param {string|null} [error=null] - The validation error message. Required when `validationState` is `'error'`.
 * @param {boolean} [touched=false] - Flag indicating if the user has interacted with the field.
 *
 * @returns {Object} Validation status and styling utilities.
 * @returns {string} Object.statusIndicator - Visual code indicating the indicator icon type to render (`'idle'`, `'validating'`, `'success'`, or `'error'`).
 * @returns {string} Object.statusMessage - A descriptive string announcement suitable for screen readers or ARIA live regions.
 * @returns {boolean} Object.shouldShowError - Helper flag to determine if the error message block should be rendered. Evaluates to true only if `touched` is true, state is `'error'`, and a non-empty `error` message exists.
 * @returns {boolean} Object.isValidating - Helper flag indicating if validation is currently in progress.
 * @returns {boolean} Object.isValid - Helper flag indicating if validation has completed successfully.
 * @returns {function(string): string} Object.fieldClassName - A memoized callback function that accepts a string of base CSS classes and returns the classes concatenated with appropriate tailwind border colors based on the validation status.
 * @returns {Object} Object.ariaAttributes - A memoized set of ARIA attributes (`aria-invalid`, `aria-describedby`, `aria-busy`) mapping to the current validation state.
 * @returns {string} Object.validationState - The original validation state string.
 * @returns {boolean} Object.touched - The original touched boolean flag.
 * @returns {string|null} Object.error - The original error string or null.
 *
 * @example
 * import React from 'react';
 * import { useValidationState } from './hooks/useValidationState';
 *
 * const FormInput = ({ label, name, value, onChange, validationState, error, touched }) => {
 *   const {
 *     shouldShowError,
 *     isValidating,
 *     fieldClassName,
 *     ariaAttributes,
 *     statusMessage
 *   } = useValidationState(name, validationState, error, touched);
 *
 *   return (
 *     <div className="input-group">
 *       <label htmlFor={name}>{label}</label>
 *       <input
 *         id={name}
 *         value={value}
 *         onChange={onChange}
 *         className={fieldClassName('px-4 py-2 border rounded-md')}
 *         {...ariaAttributes}
 *       />
 *       {isValidating && <span className="spinner">Checking availability...</span>}
 *       {shouldShowError && (
 *         <span id={`${name}-error`} className="text-red-500" role="alert">
 *           {error}
 *         </span>
 *       )}
 *       {/* Screen reader feedback region *\/
 *       <span className="sr-only" role="status" aria-live="polite">
 *         {statusMessage}
 *       </span>
 *     </div>
 *   );
 * };
 */
export const useValidationState = (
  fieldName,
  validationState = "idle",
  error = null,
  touched = false
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
    [touched, validationState]
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
