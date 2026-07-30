/**
 * Cookie Utility Module
 *
 * Centralized cookie management for consistent security attributes
 * and maintainability across the application.
 *
 * @module cookieUtils
 */

/**
 * Default cookie options for security.
 * @constant {Object}
 */
const DEFAULT_OPTIONS = {
  path: "/",
  sameSite: import.meta.env?.VITE_COOKIE_SAME_SITE || "Strict",
  secure: false,
};

/**
 * Builds a cookie string from name, value, and options.
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value (will be URI encoded)
 * @param {Object} options - Cookie options
 * @param {string} [options.path] - Cookie path (default: "/")
 * @param {number} [options.maxAge] - Max age in seconds
 * @param {string|Date} [options.expires] - Expiration date or UTC string
 * @param {boolean} [options.secure] - Secure flag (HTTPS only)
 * @param {string} [options.sameSite] - SameSite policy (Strict, Lax, None)
 * @param {string} [options.domain] - Domain scope
 * @returns {string} Formatted cookie string
 */
export function buildCookieString(name, value, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // URI encode the value for safety
  const encodedValue = encodeURIComponent(value);

  // Build the cookie string
  let cookieString = `${name}=${encodedValue}`;

  // Add path
  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }

  // Add maxAge (takes precedence over expires)
  if (opts.maxAge !== undefined) {
    cookieString += `; Max-Age=${opts.maxAge}`;
  }

  // Add expires
  if (opts.expires) {
    const expiresValue =
      opts.expires instanceof Date ? opts.expires.toUTCString() : opts.expires;
    cookieString += `; expires=${expiresValue}`;
  }

  // Add secure flag
  if (opts.secure) {
    cookieString += "; Secure";
  }

  // Add sameSite
  if (opts.sameSite) {
    cookieString += `; SameSite=${opts.sameSite}`;
  }

  // Add domain
  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }

  return cookieString;
}

/**
 * Sets a cookie with the specified options.
 *
 * Automatically determines secure flag based on protocol if not specified.
 * Defaults to SameSite=Strict for security.
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {Object} options - Cookie options
 * @param {string} [options.path="/"] - Cookie path
 * @param {number} [options.maxAge] - Max age in seconds
 * @param {string|Date} [options.expires] - Expiration date or UTC string
 * @param {boolean} [options.secure] - Secure flag (auto-detects if not specified)
 * @param {string} [options.sameSite="Strict"] - SameSite policy
 * @param {string} [options.domain] - Domain scope
 * @returns {boolean} True if cookie was set successfully
 *
 * @example
 * // Set auth token with conditional secure flag
 * setCookie("token", sessionToken, {
 *   path: "/",
 *   secure: window.location.protocol === "https:",
 *   sameSite: "Strict",
 * });
 *
 * @example
 * // Set CSRF token with secure flag
 * setCookie("XSRF-TOKEN", csrfToken, {
 *   path: "/",
 *   secure: true,
 *   sameSite: "Strict",
 * });
 */
export function setCookie(name, value, options = {}) {
  try {
    // Auto-detect secure flag based on protocol if not specified
    if (options.secure === undefined && typeof window !== "undefined") {
      options.secure = window.location.protocol === "https:";
    }

    const sameSite = options.sameSite || import.meta.env?.VITE_COOKIE_SAME_SITE || "Strict";
    if (sameSite === "None") {
      options.secure = true;
    }

    const cookieString = buildCookieString(name, value, options);

    if (typeof document !== "undefined") {
      document.cookie = cookieString;
      return true;
    }

    return false;
  } catch (error) {
    console.warn(`[cookieUtils] Failed to set cookie "${name}":`, error);
    return false;
  }
}

/**
 * Deletes a cookie by setting its expiration to the past.
 *
 * Supports deletion of cookie variants to ensure complete removal:
 * - secureVariants: Deletes both Secure and non-Secure versions
 * - domainVariants: Deletes both with and without domain
 *
 * @param {string} name - Cookie name to delete
 * @param {Object} options - Deletion options
 * @param {string} [options.path="/"] - Cookie path (must match original)
 * @param {boolean} [options.secureVariants=false] - Delete both Secure and non-Secure variants
 * @param {boolean} [options.domainVariants=false] - Delete with and without domain
 * @param {string} [options.domain] - Domain scope (if known)
 * @returns {boolean} True if deletion was attempted
 *
 * @example
 * // Delete with Secure and non-Secure variants
 * deleteCookie("token", {
 *   path: "/",
 *   secureVariants: true,
 * });
 *
 * @example
 * // Delete with domain variants
 * deleteCookie("token", {
 *   path: "/",
 *   domainVariants: true,
 * });
 */
export function deleteCookie(name, options = {}) {
  try {
    if (typeof document === "undefined") return false;

    const opts = {
      path: "/",
      secureVariants: false,
      domainVariants: false,
      ...options,
    };

    // Base deletion options
    const baseOptions = {
      path: opts.path,
      maxAge: 0,
      expires: "Thu, 01 Jan 1970 00:00:00 GMT",
    };

    // Delete base cookie
    setCookie(name, "", baseOptions);

    // Delete Secure variant if requested
    if (opts.secureVariants) {
      setCookie(name, "", { ...baseOptions, secure: true });
    }

    // Delete domain variant if requested
    if (opts.domainVariants && typeof window !== "undefined") {
      setCookie(name, "", {
        ...baseOptions,
        domain: window.location.hostname,
      });
    }

    // Delete both Secure and domain variants if both requested
    if (opts.secureVariants && opts.domainVariants && typeof window !== "undefined") {
      setCookie(name, "", {
        ...baseOptions,
        secure: true,
        domain: window.location.hostname,
      });
    }

    return true;
  } catch (error) {
    console.warn(`[cookieUtils] Failed to delete cookie "${name}":`, error);
    return false;
  }
}

/**
 * Deletes all cookies for the current domain.
 *
 * Iterates through all cookies and attempts to delete them
 * with both path and domain variants to ensure complete removal.
 *
 * @returns {boolean} True if deletion was attempted
 *
 * @example
 * // Clear all cookies on logout
 * deleteAllCookies();
 */
export function deleteAllCookies() {
  try {
    if (typeof document === "undefined") return false;

    const cookies = document.cookie.split(";");
    cookies.forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      deleteCookie(name, {
        path: "/",
        domainVariants: true,
      });
    });

    return true;
  } catch (error) {
    console.warn("[cookieUtils] Failed to delete all cookies:", error);
    return false;
  }
}

/**
 * Gets a cookie value by name.
 *
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 *
 * @example
 * const token = getCookie("token");
 */
export function getCookie(name) {
  try {
    if (typeof document === "undefined") return null;

    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  } catch (error) {
    console.warn(`[cookieUtils] Failed to get cookie "${name}":`, error);
    return null;
  }
}

/**
 * Checks if a cookie exists.
 *
 * @param {string} name - Cookie name
 * @returns {boolean} True if cookie exists
 *
 * @example
 * if (hasCookie("token")) {
 *   // Token is present
 * }
 */
export function hasCookie(name) {
  return getCookie(name) !== null;
}
