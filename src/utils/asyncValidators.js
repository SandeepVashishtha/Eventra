/**
 * Async Validation Utilities
 * Pre-built async validators for common form fields
 * Can be composed with sync validators in useFormValidation
 */

import { apiUtils } from "../config/api.js";

/**
 * Generic async validator factory
 * Creates a debounced async validator function
 *
 * @param {Function} asyncValidatorFn - Async function that returns error message or true
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @returns {Function} Debounced async validator
 */
export const createAsyncValidator = (asyncValidatorFn, debounceMs = 300) => {
  let timeoutId;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const asyncValidator = async function asyncValidator(value, ...args) {
    return new Promise((resolve) => {
      cancel();
      timeoutId = setTimeout(async () => {
        timeoutId = null;
        try {
          const result = await asyncValidatorFn(value, ...args);
          resolve(result);
        } catch (error) {
          resolve(error.message || "Validation error");
        }
      }, debounceMs);
    });
  };

  // 🔥 FIX: expose .cancel() so consumers can clear pending timeouts on
  // unmount. Without this, a field that is removed from the form leaves a
  // pending timeout that resolves into a stale validator call.
  asyncValidator.cancel = cancel;

  return asyncValidator;
};

/**
 * Retry async validator with exponential backoff
 * Useful for network requests that might fail temporarily
 *
 * @param {Function} validatorFn - Async validator function
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} initialDelay - Initial delay in ms (default: 1000)
 * @returns {Function} Retry-enabled async validator
 */
export const withRetry = (validatorFn, maxRetries = 3, initialDelay = 1000) => {
  // 🔥 FIX: refuse to run with maxRetries <= 0. Previously a 0-retry call
  // would skip the for-loop body, leave `lastError` undefined, and
  // `throw lastError` would throw `undefined` (a silent failure).
  if (!Number.isFinite(maxRetries) || maxRetries < 1) {
    throw new TypeError(
      `withRetry requires maxRetries >= 1 (got ${maxRetries})`
    );
  }

  return async function retryValidator(value, ...args) {
    let lastError = new Error("withRetry: no attempts executed");

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await validatorFn(value, ...args);
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  };
};

/**
 * Validate username availability
 * Checks if username already exists in the database
 *
 * @param {string} username - Username to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validateUsernameAvailable = async (username) => {
  if (!username || username.length < 3) return true;

  try {
    const response = await apiUtils.get(`/api/validate/username/${encodeURIComponent(username)}`);

    if (!response.ok) {
      throw new Error("Failed to validate username");
    }

    return response.data.available === true || "Username already taken";
  } catch (error) {
    console.error("Username validation error:", error);
    throw error;
  }
};

/**
 * Validate email availability
 * Checks if email is already registered
 *
 * @param {string} email - Email to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validateEmailAvailable = async (email) => {
  if (!email) return true;

  try {
    const response = await apiUtils.get(`/api/validate/email/${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error("Failed to validate email");
    }

    return response.data.available === true || "Email already registered";
  } catch (error) {
    console.error("Email validation error:", error);
    throw error;
  }
};

/**
 * Validate email with DNS/SMTP check
 * More thorough email validation including domain verification
 *
 * @param {string} email - Email to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validateEmailDomainExists = async (email) => {
  if (!email) return true;

  try {
    const response = await apiUtils.post("/api/validate/email-domain", { email });

    if (!response.ok) {
      throw new Error("Failed to validate email domain");
    }

    return response.data.valid === true || "Email domain does not exist";
  } catch (error) {
    console.error("Email domain validation error:", error);
    throw error;
  }
};

/**
 * Validate password strength against backend policies
 * Checks if password meets organization's security requirements
 *
 * @param {string} password - Password to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validatePasswordStrength = async (password) => {
  if (!password) return true;

  try {
    // In production, send to backend for policy validation
    // const response = await api.post(`/validate/password-strength`, { password });
    // return response.data.strong || 'Password does not meet strength requirements';

    // Basic client-side validation (would also be enforced server-side)
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const allMet = Object.values(requirements).every(Boolean);
    return allMet || "Password does not meet strength requirements";
  } catch (error) {
    console.error("Password strength validation error:", error);
    throw error;
  }
};

/**
 * Validate phone number format and carrier
 * Checks if phone number is valid and active
 *
 * @param {string} phone - Phone number to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validatePhoneNumber = async (phone) => {
  if (!phone) return true;

  try {
    const response = await apiUtils.post("/api/validate/phone", { phone });

    if (!response.ok) {
      throw new Error("Failed to validate phone number");
    }

    return response.data.valid === true || "Invalid phone number";
  } catch (error) {
    console.error("Phone validation error:", error);
    throw error;
  }
};

/**
 * Validate invitation code
 * Checks if an invitation code is valid and not already used
 *
 * @param {string} code - Invitation code to validate
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validateInvitationCode = async (code) => {
  if (!code) return true;

  try {
    const response = await apiUtils.get(`/api/validate/invitation-code/${encodeURIComponent(code)}`);

    if (!response.ok) {
      throw new Error("Failed to validate invitation code");
    }

    return response.data.valid === true || "Invitation code is invalid or already used";
  } catch (error) {
    console.error("Invitation code validation error:", error);
    throw error;
  }
};

/**
 * Validate coupon/promo code
 * Checks if promo code is valid and applicable
 *
 * @param {string} code - Promo code to validate
 * @param {Object} context - Additional context (userId, amount, etc.)
 * @returns {Promise<true|string>} Returns true if valid, error message if invalid
 */
export const validatePromoCode = async (code, context = {}) => {
  if (!code) return true;

  try {
    const response = await apiUtils.post("/api/validate/promo-code", { code, ...context });

    if (!response.ok) {
      throw new Error("Failed to validate promo code");
    }

    return response.data.valid === true || response.data.message || "Invalid promo code";
  } catch (error) {
    console.error("Promo code validation error:", error);
    throw error;
  }
};

/**
 * Custom async validator builder
 * Creates a validator function that calls a specific API endpoint
 *
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Options for the validator
 * @param {string} [options.method='GET'] - HTTP method
 * @param {string} [options.paramName='value'] - Parameter name for the value
 * @param {string} [options.successField='valid'] - Field to check for success
 * @param {string} [options.errorMessage] - Default error message
 * @returns {Function} Async validator function
 *
 * @example
 * const validateEventId = createCustomAsyncValidator(
 *   '/api/events/check',
 *   { paramName: 'eventId', errorMessage: 'Event not found' }
 * );
 */
export const createCustomAsyncValidator = (endpoint, options = {}) => {
  const {
    method = "GET",
    paramName = "value",
    successField = "valid",
    errorMessage = "Validation failed",
  } = options;

  return async function customValidator(value) {
    if (!value) return true;

    try {
      let url = endpoint;

      if (method === "GET") {
        url += `?${paramName}=${encodeURIComponent(value)}`;
        const response = await apiUtils.get(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.data[successField] === true || errorMessage;
      }

      const response = await apiUtils.post(url, { [paramName]: value });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.data[successField] === true || errorMessage;
    } catch (error) {
      console.error("Custom validation error:", error);
      throw error;
    }
  };
};

export default {
  createAsyncValidator,
  withRetry,
  validateUsernameAvailable,
  validateEmailAvailable,
  validateEmailDomainExists,
  validatePasswordStrength,
  validatePhoneNumber,
  validateInvitationCode,
  validatePromoCode,
  createCustomAsyncValidator,
};
