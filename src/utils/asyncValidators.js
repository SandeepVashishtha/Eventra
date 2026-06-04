/**
 * Async Validation Utilities
 * Pre-built async validators for common form fields
 * Can be composed with sync validators in useFormValidation
 */

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
  let abortController;

  return async function asyncValidator(value, ...args) {
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();
    const signal = abortController.signal;

    return new Promise((resolve) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncValidatorFn(value, { signal }, ...args);
          if (!signal.aborted) {
            resolve(result);
          }
        } catch (error) {
          if (!signal.aborted) {
            if (error.name === "AbortError") return;
            resolve(error.message || "Validation error");
          }
        }
      }, debounceMs);
    });
  };
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
  return async function retryValidator(value, ...args) {
    let lastError;

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
export const validateUsernameAvailable = async (username, { signal } = {}) => {
  if (!username || username.length < 3) return true;

  try {
    // In production, replace with actual API call:
    // const response = await api.get(`/validate/username/${username}`);
    // return response.data.available || 'Username already taken';

    // Mock implementation for demo
    const response = await fetch(
      `/api/validate/username/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate username");
    }

    const data = await response.json();
    return data.available === true || "Username already taken";
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
export const validateEmailAvailable = async (email, { signal } = {}) => {
  if (!email) return true;

  try {
    // In production, replace with actual API call:
    // const response = await api.get(`/validate/email/${email}`);
    // return response.data.available || 'Email already registered';

    // Mock implementation for demo
    const response = await fetch(
      `/api/validate/email/${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate email");
    }

    const data = await response.json();
    return data.available === true || "Email already registered";
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
export const validateEmailDomainExists = async (email, { signal } = {}) => {
  if (!email) return true;

  try {
    // In production, call your backend which performs DNS/SMTP check
    // const response = await api.post(`/validate/email-domain`, { email });
    // return response.data.valid || 'Email domain does not exist';

    // Mock implementation
    const response = await fetch("/api/validate/email-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        signal,
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate email domain");
    }

    const data = await response.json();
    return data.valid === true || "Email domain does not exist";
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
export const validatePasswordStrength = async (password, { signal } = {}) => {
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
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
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
export const validatePhoneNumber = async (phone, { signal } = {}) => {
  if (!phone) return true;

  try {
    // In production, use Twilio or similar service via backend
    // const response = await api.post(`/validate/phone`, { phone });
    // return response.data.valid || 'Invalid phone number';

    const response = await fetch("/api/validate/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        signal,
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate phone number");
    }

    const data = await response.json();
    return data.valid === true || "Invalid phone number";
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
export const validateInvitationCode = async (code, { signal } = {}) => {
  if (!code) return true;

  try {
    const response = await fetch(
      `/api/validate/invitation-code/${encodeURIComponent(code)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to validate invitation code");
    }

    const data = await response.json();
    return data.valid === true || "Invitation code is invalid or already used";
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
export const validatePromoCode = async (code, { signal } = {}, context = {}) => {
  if (!code) return true;

  try {
    const response = await fetch("/api/validate/promo-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        signal,
      body: JSON.stringify({ code, ...context }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate promo code");
    }

    const data = await response.json();
    return data.valid === true || data.message || "Invalid promo code";
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

  return async function customValidator(value, { signal } = {}) {
    if (!value) return true;

    try {
      let url = endpoint;
      let init = {
        method,
        headers: { "Content-Type": "application/json" },
        signal,
      };

      if (method === "GET") {
        url += `?${paramName}=${encodeURIComponent(value)}`;
      } else {
        init.body = JSON.stringify({ [paramName]: value });
      }

      const response = await fetch(url, init);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data[successField] === true || errorMessage;
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
