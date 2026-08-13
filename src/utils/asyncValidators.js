/**
 * Enterprise Async Validation Utilities
 *
 * Comprehensive suite of debounced, cached, resilient, and composable async validators
 * designed for complex form management, API checks, domain lookup, security rules, and real-time UI validation.
 *
 * Features:
 * - Built-in Request Deduplication & Automatic AbortSignal Cancellation
 * - LRU/TTL Response Caching Mechanism to eliminate redundant network calls
 * - Exponential Backoff & Jitter Retry Policies
 * - Parallel & Sequential Composition Pipelines
 * - Comprehensive set of pre-built domain validators (User, Commerce, Events, Security, Media, Billing)
 */

// ============================================================================
// 1. IN-MEMORY CACHE & REQUEST DEDUPLICATION
// ============================================================================

/**
 * In-Memory TTL & Capacity-Constrained Cache for Validation Results.
 */
export class ValidationCache {
  /**
   * @param {number} [ttlMs=300000] - Time to live for cached items in ms (default: 5 minutes)
   * @param {number} [maxSize=500] - Maximum capacity before eviction
   */
  constructor(ttlMs = 300000, maxSize = 500) {
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * Constructs a uniform cache key.
   * @param {string} validatorName 
   * @param {*} value 
   * @param {Object} [args={}] 
   * @returns {string}
   */
  static buildKey(validatorName, value, args = {}) {
    const serializedArgs = Object.keys(args).length ? JSON.stringify(args) : "";
    return `${validatorName}:${String(value).trim().toLowerCase()}:${serializedArgs}`;
  }

  /**
   * Retrieve cached result if unexpired.
   * @param {string} key 
   * @returns {*|undefined}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Refresh access order (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  /**
   * Store a validation result in cache.
   * @param {string} key 
   * @param {*} value 
   */
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /**
   * Clear entire cache store.
   */
  clear() {
    this.cache.clear();
  }
}

/** Default global cache instance shared across standard validators */
export const globalValidationCache = new ValidationCache(300000, 500);

/**
 * Manages active AbortController instances per validation field target.
 */
export class RequestDeduplicator {
  constructor() {
    this.controllers = new Map();
  }

  /**
   * Cancels any pending request for the given field key and produces a new AbortSignal.
   * @param {string} key - Field identifier
   * @returns {AbortSignal}
   */
  getSignal(key) {
    if (this.controllers.has(key)) {
      this.controllers.get(key).abort();
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller.signal;
  }

  /**
   * Clears signal tracking for completed requests.
   * @param {string} key 
   */
  cleanup(key) {
    this.controllers.delete(key);
  }
}

export const globalDeduplicator = new RequestDeduplicator();

// ============================================================================
// 2. HIGHER-ORDER VALIDATOR COMPOSERS & DECORATORS
// ============================================================================

/**
 * Creates a debounced and cancelable async validator.
 *
 * @param {Function} asyncValidatorFn - Async validation function receiving (value, signal, ...args)
 * @param {number} [debounceMs=300] - Debounce delay in milliseconds
 * @param {Object} [options={}] - Extra configuration options
 * @param {string} [options.fieldKey] - Unique key for request cancellation tracking
 * @returns {Function} Debounced async validator function
 */
export const createAsyncValidator = (asyncValidatorFn, debounceMs = 300, options = {}) => {
  let timeoutId = null;
  const fieldKey = options.fieldKey || Symbol("asyncField");

  return function debouncedAsyncValidator(value, ...args) {
    return new Promise((resolve) => {
      if (timeoutId) clearTimeout(timeoutId);

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        const signal = globalDeduplicator.getSignal(fieldKey);
        try {
          const result = await asyncValidatorFn(value, signal, ...args);
          globalDeduplicator.cleanup(fieldKey);
          resolve(result);
        } catch (error) {
          globalDeduplicator.cleanup(fieldKey);

          if (error.name === "AbortError") {
            // Silently resolve true for aborted requests to prevent stale UI error flash
            resolve(true);
          } else {
            resolve(error.message || "Validation error occurred");
          }
        }
      }, delayMs);
    });
  };
};

/**
 * Decorates an async validator function with exponential backoff and randomized jitter retries.
 *
 * @param {Function} validatorFn - Target validator
 * @param {number} [maxRetries=3] - Maximum retry attempts
 * @param {number} [initialDelay=500] - Base delay in milliseconds
 * @returns {Function} Retry-wrapped async validator
 */
export const withRetry = (validatorFn, maxRetries = 3, initialDelay = 500) => {
  return async function retryValidator(value, ...args) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        return await validator(...args);
      } catch (error) {
        lastError = error;

        // Do not retry explicitly aborted requests or client 4xx user input errors
        if (error.name === "AbortError" || (error.status >= 400 && error.status < 500)) {
          throw error;
        }

        if (attempt < maxRetries - 1) {
          const backoff = initialDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
        }
      }
    }

    throw lastError;
  };
};

/**
 * Enforces a strict upper timeout limit on an async validator execution.
 *
 * @param {Function} validatorFn - Async validator function
 * @param {number} [timeoutMs=5000] - Hard timeout limit in milliseconds
 * @param {string} [timeoutMessage="Validation request timed out"] - Fallback error
 * @returns {Function} Timeout-wrapped async validator
 */
export const withTimeout = (validatorFn, timeoutMs = 5000, timeoutMessage = "Validation request timed out") => {
  return async function timeoutValidator(value, ...args) {
    let timer;

    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([validatorFn(value, ...args), timeoutPromise]);
      clearTimeout(timer);
      return result;
    } catch (error) {
      clearTimeout(timer);
      throw error;
    }
  };
};

/**
 * Wraps an async validator with in-memory memoization cache.
 *
 * @param {Function} validatorFn - Async validator function
 * @param {string} validatorName - Unique identifier for key generation
 * @param {ValidationCache} [cacheInstance=globalValidationCache] - Custom cache instance
 * @returns {Function} Cached async validator
 */
export const withCache = (validatorFn, validatorName, cacheInstance = globalValidationCache) => {
  return async function cachedValidator(value, ...args) {
    if (value === null || value === undefined || value === "") {
      return true;
    }

    const cacheKey = ValidationCache.buildKey(validatorName, value, args[0]);
    const cachedResult = cacheInstance.get(cacheKey);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = await validatorFn(value, ...args);
    cacheInstance.set(cacheKey, result);
    return result;
  };
};

/**
 * Wraps an async validator to capture uncaught API/Network failures and return a friendly fallback.
 *
 * @param {Function} validatorFn - Async validator function
 * @param {string|boolean} [fallbackResult="Validation unavailable. Please try again."] - Fallback value
 * @returns {Function} Resilient async validator
 */
export const withFallback = (validatorFn, fallbackResult = "Validation unavailable. Please try again.") => {
  return async function fallbackValidator(value, ...args) {
    try {
      return await validatorFn(value, ...args);
    } catch (error) {
      console.warn("Async validator failed with error, applying fallback:", error);
      return fallbackResult;
    }
  };
};

/**
 * Sequentially executes multiple async validators, stopping at the first failing rule.
 *
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {Function} Composed sequential async validator
 */
export const composeAsyncValidatorsSequential = (validators = []) => {
  return async function sequentialValidator(value, ...args) {
    for (const validator of validators) {
      const result = await validator(value, ...args);
      if (result !== true) {
        return result; // Early exit on first error message
      }
    }
    return true;
  };
};

/**
 * Executes multiple async validators in parallel, returning all validation failure messages if present.
 *
 * @param {Array<Function>} validators - Array of validator functions
 * @returns {Function} Parallel async validator returning true or combined error string
 */
export const composeAsyncValidatorsParallel = (validators = []) => {
  return async function parallelValidator(value, ...args) {
    const results = await Promise.all(validators.map((fn) => fn(value, ...args)));
    const errors = results.filter((res) => res !== true && typeof res === "string");

    if (errors.length > 0) {
      return errors.join(". ");
    }
    return true;
  };
};

// ============================================================================
// 3. USER ACCOUNT & IDENTIFIER VALIDATORS
// ============================================================================

/**
 * Validates username availability via server check.
 *
 * @param {string} username - Target username
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validateUsernameAvailable = async (username, signal) => {
  if (!username || username.trim().length < 3) return true;

  try {
    const response = await fetch(`/api/validate/username/${encodeURIComponent(username.trim())}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to validate username");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.available === true || data.message || "Username already taken";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Username validation error:", error);
    throw error;
  }
};

/**
 * Validates email address availability.
 *
 * @param {string} email - Target email
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validateEmailAvailable = async (email, signal) => {
  if (!email || !email.includes("@")) return true;

  try {
    const response = await fetch(`/api/validate/email/${encodeURIComponent(email.trim().toLowerCase())}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to validate email availability");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.available === true || data.message || "Email is already registered";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Email availability error:", error);
    throw error;
  }
};

/**
 * Performs deep DNS MX and domain reachability verification for an email address.
 *
 * @param {string} email - Email address
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validateEmailDomainExists = async (email, signal) => {
  if (!email || !email.includes("@")) return true;

  try {
    const response = await fetch("/api/validate/email-domain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to verify domain existence");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.valid === true || data.reason || "Email domain does not exist or cannot receive mail";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Email domain validation error:", error);
    throw error;
  }
};

/**
 * Checks password strength against server security policies and HaveIBeenPwned breach databases.
 *
 * @param {string} password - Password string
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validatePasswordStrength = async (password, signal) => {
  if (!password) return true;

  // Basic structural rule checks before performing heavy network request
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return "Password must be 8+ chars and contain uppercase, lowercase, number, and special symbol";
  }

  try {
    const response = await fetch("/api/validate/password-policy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      signal,
    });

    if (!response.ok) return true; // Graceful degrade if service unavailable

    const data = await response.json();
    if (data.isPwned) {
      return `This password appeared in ${data.breachCount || "known"} data breaches. Choose a safer password.`;
    }

    return data.strong === true || data.message || "Password does not satisfy organizational policy";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true; // Fall back safely on local checks
  }
};

/**
 * Validates social media platform handles (e.g. GitHub, Twitter/X, LinkedIn).
 *
 * @param {string} handle - Handle string without prefix
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Options containing platform
 * @param {string} [options.platform='github'] - Target platform
 * @returns {Promise<true|string>}
 */
export const validateSocialHandleExists = async (handle, signal, options = {}) => {
  if (!handle) return true;
  const platform = options.platform || "github";
  const cleanHandle = handle.replace(/^@/, "").trim();

  try {
    const response = await fetch(`/api/validate/social-handle?platform=${platform}&handle=${encodeURIComponent(cleanHandle)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.exists === true || `${platform} user "@${cleanHandle}" could not be found`;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

// ============================================================================
// 4. TELECOM, GEOGRAPHY & ADDRESS VALIDATORS
// ============================================================================

/**
 * Validates phone numbers using carrier lookup services (Twilio, Numverify).
 *
 * @param {string} phone - Phone number with or without country code
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Options like default country code
 * @returns {Promise<true|string>}
 */
export const validatePhoneNumber = async (phone, signal, options = {}) => {
  if (!phone) return true;

  try {
    const response = await fetch("/api/validate/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim(), country: options.country || "US" }),
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to validate phone number");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.valid === true || data.message || "Invalid or unassigned phone number";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Phone validation error:", error);
    throw error;
  }
};

/**
 * Validates postal / ZIP code format and presence within a given country region.
 *
 * @param {string} postalCode - Postal or ZIP code
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Options containing country code
 * @returns {Promise<true|string>}
 */
export const validatePostalCodeForRegion = async (postalCode, signal, options = {}) => {
  if (!postalCode) return true;
  const country = options.country || "US";

  try {
    const response = await fetch(`/api/validate/postal-code?code=${encodeURIComponent(postalCode.trim())}&country=${country}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.valid === true || `Postal code is invalid for ${country}`;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

/**
 * Validates address via address geocoding / verification API (e.g. Radar, Smarty, Google Places).
 *
 * @param {Object|string} address - Address string or structured object
 * @param {AbortSignal} [signal] - Fetch signal
 * @returns {Promise<true|string>}
 */
export const validateAddressGeocode = async (address, signal) => {
  if (!address) return true;

  try {
    const response = await fetch("/api/validate/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(typeof address === "string" ? { rawAddress: address } : address),
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.deliverable === true || data.suggestedAddress || "Address could not be verified";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

// ============================================================================
// 5. COMMERCE, BILLING & TAX VALIDATORS
// ============================================================================

/**
 * Validates coupon, promotional, or discount codes against cart context.
 *
 * @param {string} code - Promo code string
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @param {Object} [context={}] - Cart items, total amount, user ID
 * @returns {Promise<true|string>}
 */
export const validatePromoCode = async (code, signal, context = {}) => {
  if (!code) return true;

  try {
    const response = await fetch("/api/validate/promo-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase(), ...context }),
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to validate promo code");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.valid === true || data.message || "Invalid or expired promotional code";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Promo code validation error:", error);
    throw error;
  }
};

/**
 * Validates Tax Identification Number / VAT / EIN numbers via VIES or TaxAPI.
 *
 * @param {string} taxId - Tax identification string
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @param {Object} [options] - Options containing country code
 * @returns {Promise<true|string>}
 */
export const validateTaxId = async (taxId, signal, options = {}) => {
  if (!taxId) return true;
  const country = options.country || "US";

  try {
    const response = await fetch("/api/validate/tax-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taxId: taxId.trim(), country }),
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.valid === true || data.message || "Tax ID / VAT number is invalid or inactive";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

/**
 * Validates Credit Card BIN / IIN lookup for brand, type, and issuing bank checks.
 *
 * @param {string} cardNumber - Credit card number (minimum first 6 digits required)
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Allowed card types, e.g., { allowedTypes: ['credit', 'debit'] }
 * @returns {Promise<true|string>}
 */
export const validateCreditCardBIN = async (cardNumber, signal, options = {}) => {
  const cleanNumber = String(cardNumber || "").replace(/\D/g, "");
  if (cleanNumber.length < 6) return true;

  const bin = cleanNumber.slice(0, 6);

  try {
    const response = await fetch(`/api/validate/credit-card-bin/${bin}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    if (options.allowedTypes && !options.allowedTypes.includes(data.cardType)) {
      return `Only ${options.allowedTypes.join(", ")} cards are accepted`;
    }

    return data.valid !== false || "Card issuer is unsupported";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

/**
 * Validates ACH / ABA Banking routing numbers.
 *
 * @param {string} routingNumber - 9-digit ABA routing number
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validateBankRoutingNumber = async (routingNumber, signal) => {
  const cleanRouting = String(routingNumber || "").replace(/\D/g, "");
  if (cleanRouting.length !== 9) return true;

  try {
    const response = await fetch(`/api/validate/bank-routing/${cleanRouting}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.valid === true || data.message || "Invalid ABA bank routing number";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

// ============================================================================
// 6. EVENT MANAGEMENT & TICKETING VALIDATORS
// ============================================================================

/**
 * Validates event invitation codes for exclusivity or early access registration.
 *
 * @param {string} code - Invitation code string
 * @param {AbortSignal} [signal] - Fetch signal
 * @returns {Promise<true|string>}
 */
export const validateInvitationCode = async (code, signal) => {
  if (!code) return true;

  try {
    const response = await fetch(`/api/validate/invitation-code/${encodeURIComponent(code.trim())}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) {
      const err = new Error("Failed to validate invitation code");
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data.valid === true || data.message || "Invitation code is invalid or already claimed";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    console.error("Invitation code validation error:", error);
    throw error;
  }
};

/**
 * Checks if a proposed event URL slug is unique and available.
 *
 * @param {string} slug - Event URL slug
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Options containing current event ID for edits
 * @returns {Promise<true|string>}
 */
export const validateEventSlugAvailable = async (slug, signal, options = {}) => {
  if (!slug) return true;

  try {
    const queryParams = new URLSearchParams({
      slug: slug.trim().toLowerCase(),
      ...(options.excludeEventId ? { excludeId: options.excludeEventId } : {}),
    });

    const response = await fetch(`/api/validate/event-slug?${queryParams}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.available === true || "Event URL slug is already taken";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

/**
 * Validates ticket tier remaining capacity for selected ticket quantities.
 *
 * @param {number|string} quantity - Desired ticket count
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} options - Must contain ticketTierId
 * @returns {Promise<true|string>}
 */
export const validateTicketQuotaAvailable = async (quantity, signal, options = {}) => {
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0 || !options.ticketTierId) return true;

  try {
    const response = await fetch("/api/validate/ticket-quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketTierId: options.ticketTierId, quantity: qty }),
      signal,
    });

    if (!response.ok) return true;

    const data = await response.json();
    return data.available === true || data.message || `Only ${data.remainingCount || 0} tickets remaining`;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return true;
  }
};

// ============================================================================
// 7. FILES & MEDIA ASSET VALIDATORS
// ============================================================================

/**
 * Verifies that a given asset URL exists and responds with 200 OK via HTTP HEAD request.
 *
 * @param {string} url - Asset target URL
 * @param {AbortSignal} [signal] - Fetch abort signal
 * @returns {Promise<true|string>}
 */
export const validateFileUrlExists = async (url, signal) => {
  if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) return true;

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal,
    });

    return response.ok || "File URL cannot be reached or returns 404 Not Found";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return "URL is unreachable or blocked by CORS policies";
  }
};

/**
 * Validates remote image dimensions (width, height, ratio) asynchronously.
 *
 * @param {string} imageUrl - Direct image URL
 * @param {AbortSignal} [signal] - Unused signal for API compatibility
 * @param {Object} [options] - Options e.g. { minWidth: 800, minHeight: 600, aspectRatio: 16/9 }
 * @returns {Promise<true|string>}
 */
export const validateImageUrlDimensions = async (imageUrl, signal, options = {}) => {
  if (!imageUrl || (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://"))) return true;

  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      const { minWidth, minHeight, maxWidth, maxHeight } = options;

      if (minWidth && img.width < minWidth) {
        return resolve(`Image width must be at least ${minWidth}px (actual: ${img.width}px)`);
      }
      if (minHeight && img.height < minHeight) {
        return resolve(`Image height must be at least ${minHeight}px (actual: ${img.height}px)`);
      }
      if (maxWidth && img.width > maxWidth) {
        return resolve(`Image width cannot exceed ${maxWidth}px`);
      }
      if (maxHeight && img.height > maxHeight) {
        return resolve(`Image height cannot exceed ${maxHeight}px`);
      }

      resolve(true);
    };

    img.onerror = () => {
      resolve("Failed to load image from given URL");
    };
  });
};

// ============================================================================
// 8. SECURITY, TOKENS & CAPTCHA VALIDATORS
// ============================================================================

/**
 * Validates 2FA / TOTP authentication code against backend auth service.
 *
 * @param {string} code - 6-digit TOTP code
 * @param {AbortSignal} [signal] - Fetch signal
 * @param {Object} [options] - Options containing context token
 * @returns {Promise<true|string>}
 */
export const validateTotpCode = async (code, signal, options = {}) => {
  const cleanCode = String(code || "").trim();
  if (cleanCode.length !== 6) return true;

  try {
    const response = await fetch("/api/validate/totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: cleanCode, sessionToken: options.sessionToken }),
      signal,
    });

    if (!response.ok) return "Invalid 2FA authentication code";

    const data = await response.json();
    return data.valid === true || data.message || "Invalid 2FA authentication code";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return "Failed to verify 2FA code";
  }
};

/**
 * Validates reCAPTCHA v3 or Cloudflare Turnstile tokens.
 *
 * @param {string} token - Client CAPTCHA response token
 * @param {AbortSignal} [signal] - Fetch signal
 * @returns {Promise<true|string>}
 */
export const validateCaptchaToken = async (token, signal) => {
  if (!token) return "CAPTCHA verification is required";

  try {
    const response = await fetch("/api/validate/captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal,
    });

    if (!response.ok) return "CAPTCHA verification failed";

    const data = await response.json();
    return data.success === true || "Bot verification check failed";
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return "Unable to complete CAPTCHA verification";
  }
};

// ============================================================================
// 9. DYNAMIC CUSTOM VALIDATOR FACTORIES
// ============================================================================

/**
 * Dynamic REST endpoint async validator factory.
 *
 * @param {string} endpoint - API URL
 * @param {Object} [options={}] - Configurable parameters
 * @param {string} [options.method='GET'] - HTTP Method
 * @param {string} [options.paramName='value'] - Query param or JSON payload key
 * @param {string} [options.successField='valid'] - JSON boolean response field
 * @param {string} [options.errorMessage='Validation failed'] - Custom message
 * @returns {Function} Async validator function
 */
export const createCustomAsyncValidator = (endpoint, options = {}) => {
  const {
    method = "GET",
    paramName = "value",
    successField = "valid",
    errorMessage = "Validation failed",
  } = options;

  return async function customValidator(value, signal) {
    if (value === null || value === undefined || value === "") return true;

    try {
      let url = endpoint;
      const init = {
        method,
        headers: { "Content-Type": "application/json" },
        signal,
      };

      if (method.toUpperCase() === "GET") {
        const separator = url.includes("?") ? "&" : "?";
        url += `${separator}${encodeURIComponent(paramName)}=${encodeURIComponent(value)}`;
      } else {
        init.body = JSON.stringify({ [paramName]: value });
      }

      const response = await fetch(url, init);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data[successField] === true || data.message || errorMessage;
    } catch (error) {
      if (error.name === "AbortError") throw error;
      console.error("Custom validation error:", error);
      throw error;
    }
  };
};

/**
 * GraphQL Query Async Validator Factory.
 *
 * @param {string} endpoint - GraphQL Endpoint
 * @param {string} query - GraphQL Document String
 * @param {Function} variablesMapper - Map value to GraphQL variables object
 * @param {Function} resultExtractor - Function taking data object and returning true or string error
 * @returns {Function}
 */
export const createGraphQLAsyncValidator = (endpoint, query, variablesMapper, resultExtractor) => {
  return async function graphQLValidator(value, signal) {
    if (value === null || value === undefined || value === "") return true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: variablesMapper(value),
        }),
        signal,
      });

      if (!response.ok) throw new Error(`GraphQL HTTP ${response.status}`);

      const { data, errors } = await response.json();
      if (errors && errors.length > 0) {
        return errors[0].message || "Validation query error";
      }

      return resultExtractor(data);
    } catch (error) {
      if (error.name === "AbortError") throw error;
      throw error;
    }
  };
};

// ============================================================================
// 10. PRE-DECORATED READY-TO-USE VALIDATORS
// ============================================================================

export const debouncedUsernameValidator = createAsyncValidator(
  withCache(withRetry(validateUsernameAvailable), "username"),
  350,
  { fieldKey: "username" }
);

export const debouncedEmailValidator = createAsyncValidator(
  withCache(withRetry(validateEmailAvailable), "email"),
  350,
  { fieldKey: "email" }
);

export const debouncedPhoneValidator = createAsyncValidator(
  withCache(withRetry(validatePhoneNumber), "phone"),
  400,
  { fieldKey: "phone" }
);

export const debouncedPromoCodeValidator = createAsyncValidator(
  withCache(validatePromoCode, "promoCode"),
  400,
  { fieldKey: "promoCode" }
);

// ============================================================================
// 11. DEFAULT EXPORT
// ============================================================================

export default {
  // Cache & Deduplication
  ValidationCache,
  globalValidationCache,
  RequestDeduplicator,
  globalDeduplicator,

  // Higher-Order Decorators
  createAsyncValidator,
  withRetry,
  withTimeout,
  withCache,
  withFallback,
  composeAsyncValidatorsSequential,
  composeAsyncValidatorsParallel,

  // Account & User Validators
  validateUsernameAvailable,
  validateEmailAvailable,
  validateEmailDomainExists,
  validatePasswordStrength,
  validateSocialHandleExists,

  // Telecom & Location Validators
  validatePhoneNumber,
  validatePostalCodeForRegion,
  validateAddressGeocode,

  // Commerce & Billing Validators
  validatePromoCode,
  validateTaxId,
  validateCreditCardBIN,
  validateBankRoutingNumber,

  // Event & Ticket Validators
  validateInvitationCode,
  validateEventSlugAvailable,
  validateTicketQuotaAvailable,

  // Asset & File Validators
  validateFileUrlExists,
  validateImageUrlDimensions,

  // Security & Token Validators
  validateTotpCode,
  validateCaptchaToken,

  // Generic Factories
  createCustomAsyncValidator,
  createGraphQLAsyncValidator,

  // Pre-configured Exported Instances
  debouncedUsernameValidator,
  debouncedEmailValidator,
  debouncedPhoneValidator,
  debouncedPromoCodeValidator,
};
