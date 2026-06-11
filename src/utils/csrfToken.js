/**
 * CSRF Token Management Utility
 *
 * Reads the CSRF token from a <meta> tag or cookie and provides
 * a helper to attach it to fetch requests.
 */

const CSRF_META_NAME = "csrf-token";
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-CSRF-Token";

/**
 * Reads the CSRF token from the page's <meta> tag.
 * Expected: <meta name="csrf-token" content="TOKEN_VALUE">
 * @returns {string|null}
 */
export function getCSRFTokenFromMeta() {
  const meta = document.querySelector(`meta[name="${CSRF_META_NAME}"]`);
  return meta ? meta.getAttribute("content") : null;
}

/**
 * Reads the CSRF token from a cookie.
 * @param {string} [name] - Cookie name (default: XSRF-TOKEN)
 * @returns {string|null}
 */
export function getCSRFTokenFromCookie(name = CSRF_COOKIE_NAME) {
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
 * Wraps the native fetch API to automatically include the CSRF token
 * on state-changing requests (POST, PUT, PATCH, DELETE).
 *
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<Response>}
 */
export function csrfFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const needsCSRF = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  if (needsCSRF) {
    const token = getCSRFToken();
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
    if (typeof document !== "undefined") {
      document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(newToken)}; path=/; SameSite=Strict; Secure`;
    }
  }
}
