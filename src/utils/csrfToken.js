/**
 * CSRF Token Management Utility
 *
 * Reads the CSRF token from a <meta> tag or cookie and provides
 * a helper to attach it to fetch requests.
 */

import { setCookie } from "./cookieUtils.js";

const CSRF_META_NAME = "csrf-token";
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-CSRF-Token";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const getCSRFEnforcementMode = () => {
  const validModes = ["strict", "warning", "disabled"];
  
  const isProduction =
    (typeof process !== "undefined" && process.env?.NODE_ENV === "production") ||
    (typeof import.meta.env !== "undefined" && import.meta.env?.MODE === "production");
  
  const defaultMode = isProduction ? "strict" : "warning";
  
  let configuredMode;
  if (typeof import.meta.env !== "undefined" && import.meta.env.VITE_CSRF_ENFORCEMENT_MODE) {
    configuredMode = import.meta.env.VITE_CSRF_ENFORCEMENT_MODE;
  } else if (typeof process !== "undefined" && process.env?.VITE_CSRF_ENFORCEMENT_MODE) {
    configuredMode = process.env.VITE_CSRF_ENFORCEMENT_MODE;
  }
  
  if (configuredMode && !validModes.includes(configuredMode)) {
    console.warn(
      `[CSRF] Invalid VITE_CSRF_ENFORCEMENT_MODE value: "${configuredMode}". ` +
      `Valid values are: ${validModes.join(", ")}. ` +
      `Falling back to environment default: "${defaultMode}".`
    );
    return defaultMode;
  }
  
  return configuredMode || defaultMode;
};

/**
 * Reads the CSRF token from the page's <meta> tag.
 * Expected: <meta name="csrf-token" content="TOKEN_VALUE">
 * @returns {string|null}
 */
export function getCSRFTokenFromMeta() {
  if (typeof document === "undefined") return null;
  const meta = document.querySelector(`meta[name="${CSRF_META_NAME}"]`);
  return meta ? meta.getAttribute("content") : null;
}

/**
 * Reads the CSRF token from a cookie.
 * @param {string} [name] - Cookie name (default: XSRF-TOKEN)
 * @returns {string|null}
 */
export function getCSRFTokenFromCookie(name = CSRF_COOKIE_NAME) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Gets the CSRF token from meta tag or cookie (in that order).
 * @returns {string|null}
 */
export function getCSRFToken() {
  return getCSRFTokenFromMeta() || getCSRFTokenFromCookie();
}

/**
 * Determines whether a request method requires CSRF protection.
 * @param {string} method - HTTP method (case-insensitive)
 * @returns {boolean}
 */
export function requiresCSRF(method) {
  return MUTATING_METHODS.has(method?.toUpperCase());
}

/**
 * Validates CSRF token for a mutating request.
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @returns {{ valid: boolean, error?: Error }}
 */
export function validateCSRFToken(method, url) {
  if (!requiresCSRF(method)) {
    return { valid: true };
  }

  const token = getCSRFToken();
  const enforcementMode = getCSRFEnforcementMode();

  if (!token) {
    if (enforcementMode === "strict") {
      return {
        valid: false,
        error: new Error(`CSRF token required for ${method} request to ${url}`),
      };
    }

    return { valid: true };
  }

  return { valid: true };
}

/**
 * Wraps the native fetch API to automatically include the CSRF token
 * on state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
export function csrfFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const needsCSRF = requiresCSRF(method);

  if (needsCSRF) {
    const token = getCSRFToken();
    const enforcementMode = getCSRFEnforcementMode();

    if (!token) {
      if (enforcementMode === "strict") {
        return Promise.reject(
          new Error(`CSRF token required for ${method} request to ${url}`),
        );
      }
    }

    if (token) {
      if (typeof Headers !== "undefined" && options.headers instanceof Headers) {
        options.headers.set(CSRF_HEADER_NAME, token);
      } else {
        options.headers = {
          ...options.headers,
          [CSRF_HEADER_NAME]: token,
        };
      }
    }
  }

  return fetch(url, options);
}

export function rotateCSRFToken(newToken) {
  if (newToken && typeof newToken === "string") {
    // Update cookies
    setCookie(CSRF_COOKIE_NAME, newToken, {
      path: "/",
      secure: true,
      sameSite: "Strict",
    });
  }
}
