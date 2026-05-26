/**
 * secureStorage.js
 *
 * CURRENT STATE  ─ localStorage (transitional)
 * ─────────────────────────────────────────────
 * Tokens and user data are temporarily stored in plain localStorage while
 * the codebase migrates to HttpOnly cookies (see MIGRATION PLAN below).
 *
 * WHY localStorage IS A SECURITY RISK
 * ────────────────────────────────────
 * Any JavaScript running on the page — including injected XSS payloads or
 * compromised npm packages — can read localStorage without restriction:
 *
 *   localStorage.getItem("token")  // ← any script can do this
 *
 * This makes stored JWTs vulnerable to theft even if the rest of the
 * application is otherwise secure.
 *
 * MIGRATION PLAN  ─ HttpOnly Cookies
 * ────────────────────────────────────
 * HttpOnly cookies are completely inaccessible to JavaScript. The browser
 * sends them automatically with every same-origin and credentialed request.
 *
 * Required backend changes:
 *   1. On login success: Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
 *   2. Expose a POST /api/auth/logout endpoint that clears the cookie server-side.
 *   3. All protected endpoints read the token from the cookie, not the header.
 *
 * Required frontend changes (once backend supports cookies):
 *   1. Remove setToken / getToken / removeToken calls from AuthContext.
 *   2. Remove the manual Authorization header injection in config/api.js.
 *   3. Ensure Axios keeps withCredentials: true (already set).
 *   4. Remove all localStorage.setItem("token", ...) calls.
 *
 * NOTE: Client-side encryption was intentionally removed — it provided no
 * real XSS protection because the encryption key was also stored in
 * localStorage, making the entire scheme bypassable with a single read.
 *
 * syncSecureStorage is kept as a plain-text pass-through wrapper to prevent
 * breaking existing imports throughout the application during the transition.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

// ─── Token helpers ────────────────────────────────────────────────────────────

/**
 * Persists the Eventra JWT to localStorage.
 *
 * TODO: Remove once the backend sets the token via an HttpOnly cookie.
 * Until then, this is the only storage mechanism available on the frontend.
 *
 * @param {string} token - The Eventra-issued JWT returned by the backend
 */
export const setToken = (token) => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('[secureStorage] Error setting token:', error);
  }
};

/**
 * Retrieves the stored JWT from localStorage.
 *
 * TODO: Remove once the backend manages the token via an HttpOnly cookie
 * (at which point the browser sends the cookie automatically).
 *
 * @returns {string|null} The stored JWT, or null if not present
 */
export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('[secureStorage] Error getting token:', error);
    return null;
  }
};

/**
 * Removes the stored JWT from localStorage on logout.
 *
 * Also clears any legacy encryption-key artefacts that may still be present
 * in old browser sessions from the previous (insecure) encrypted-storage
 * implementation.
 *
 * TODO: Replace with a call to POST /api/auth/logout once the backend
 * manages the session via HttpOnly cookies.
 */
export const removeToken = () => {
  try {
    localStorage.removeItem('token');

    // Wipe the legacy key-in-storage artefact if it exists from an old session.
    // The old implementation stored the encryption key in localStorage, which
    // made the "encryption" trivially bypassable — it has been removed.
    localStorage.removeItem('ENCRYPTION_KEY_KEY');
  } catch (error) {
    console.error('[secureStorage] Error removing token:', error);
  }
};

// ─── Generic key–value storage wrapper ───────────────────────────────────────

/**
 * syncSecureStorage
 *
 * A pass-through wrapper around localStorage that maintains API compatibility
 * with the old encrypted-storage implementation. It is kept to avoid breaking
 * the many existing call sites throughout the application.
 *
 * This wrapper does NOT provide encryption or additional security.
 * Do not store sensitive values (passwords, PII) through this interface.
 */
export const syncSecureStorage = {
  /**
   * Stores a string value under the given key.
   * @param {string} key
   * @param {string} value
   * @returns {boolean} true on success, false on failure
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('[secureStorage] setItem failed:', error);
      return false;
    }
  },

  /**
   * Retrieves the value stored under the given key.
   * @param {string} key
   * @returns {string|null}
   */
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[secureStorage] getItem failed:', error);
      return null;
    }
  },

  /**
   * Removes the value stored under the given key.
   * @param {string} key
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('[secureStorage] removeItem failed:', error);
    }
  },

  /**
   * Clears all localStorage data for the current origin.
   * Use with caution — this removes ALL keys, not just Eventra's.
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[secureStorage] clear failed:', error);
    }
  },
};
