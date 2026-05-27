/**
 * secureStorage.js
 *
 * CURRENT STATE: sessionStorage (transitional)
 *
 * Tokens are stored in sessionStorage while the codebase migrates to
 * HttpOnly cookies (see MIGRATION PLAN below).
 *
 * WHY localStorage IS A SECURITY RISK
 *
 * Any JavaScript running on the page, including injected XSS payloads or
 * compromised third-party scripts, can read localStorage without restriction:
 *
 *   localStorage.getItem("token")  // any script can do this
 *
 * localStorage persists indefinitely across browser restarts, giving an
 * attacker a large window to exfiltrate and reuse a stolen token.
 *
 * WHY sessionStorage IS AN IMPROVEMENT
 *
 * sessionStorage is also readable by JavaScript on the same origin, so it
 * does not eliminate XSS risk. However it provides two meaningful improvements:
 *
 *   1. The token is cleared automatically when the browser tab or window is
 *      closed, shrinking the theft-and-reuse window considerably.
 *   2. sessionStorage is tab-isolated: a script injected into one tab cannot
 *      read tokens from another tab's sessionStorage.
 *
 * MIGRATION PLAN: HttpOnly Cookies (follow-up work)
 *
 * HttpOnly cookies are completely inaccessible to JavaScript. The browser
 * sends them automatically with every same-origin credentialed request.
 *
 * Required backend changes:
 *   1. On login success: Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict
 *   2. Expose POST /api/auth/logout that clears the cookie server-side.
 *   3. All protected endpoints read the token from the cookie, not the header.
 *
 * Required frontend changes (once backend supports cookies):
 *   1. Remove setToken / getToken / removeToken calls from AuthContext.
 *   2. Remove the manual Authorization header injection in config/api.js.
 *   3. Ensure Axios keeps withCredentials: true (already set).
 *   4. Remove all sessionStorage.setItem("token", ...) calls.
 *
 * NOTE: Client-side encryption was intentionally removed. It provided no
 * real XSS protection because the encryption key was also stored in
 * localStorage, making the entire scheme bypassable with a single read.
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 */

// ---------------------------------------------------------------------------
// One-time migration: move any token left in localStorage into sessionStorage
// so existing logged-in users are not silently signed out after this change.
// The localStorage entry is removed immediately after the move.
// ---------------------------------------------------------------------------
(function migrateTokenToSessionStorage() {
  try {
    const legacy = localStorage.getItem('token');
    if (legacy && !sessionStorage.getItem('token')) {
      sessionStorage.setItem('token', legacy);
    }
    if (legacy) {
      localStorage.removeItem('token');
    }
    // Remove the old encryption-key artefact from any pre-migration session.
    localStorage.removeItem('ENCRYPTION_KEY_KEY');
  } catch {
    // Storage may be unavailable (e.g. private browsing with strict settings).
  }
})();

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Persists the Eventra JWT to sessionStorage.
 *
 * The token is scoped to the current browser tab and cleared automatically
 * when the tab is closed.
 *
 * TODO: Remove once the backend sets the token via an HttpOnly cookie.
 *
 * @param {string} token - The Eventra-issued JWT returned by the backend
 */
export const setToken = (token) => {
  try {
    sessionStorage.setItem('token', token);
  } catch (error) {
    console.error('[secureStorage] Error setting token:', error);
  }
};

/**
 * Retrieves the stored JWT from sessionStorage.
 *
 * TODO: Remove once the backend manages the token via an HttpOnly cookie.
 *
 * @returns {string|null} The stored JWT, or null if not present
 */
export const getToken = () => {
  try {
    return sessionStorage.getItem('token');
  } catch (error) {
    console.error('[secureStorage] Error getting token:', error);
    return null;
  }
};

/**
 * Removes the stored JWT from sessionStorage on logout.
 *
 * TODO: Replace with a call to POST /api/auth/logout once the backend
 * manages the session via HttpOnly cookies.
 */
export const removeToken = () => {
  try {
    sessionStorage.removeItem('token');
  } catch (error) {
    console.error('[secureStorage] Error removing token:', error);
  }
};

// ---------------------------------------------------------------------------
// Generic key-value storage wrapper
// ---------------------------------------------------------------------------

/**
 * syncSecureStorage
 *
 * A pass-through wrapper around localStorage that maintains API compatibility
 * with the old encrypted-storage implementation. It is kept to avoid breaking
 * existing call sites throughout the application.
 *
 * NOTE: This wrapper is intentionally kept on localStorage for non-sensitive
 * user-preference data (event bookmarks, interests, UI state). Only the auth
 * token is moved to sessionStorage. Do not store passwords or raw secrets here.
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
   * Use with caution: this removes ALL keys, not just Eventra's.
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('[secureStorage] clear failed:', error);
    }
  },
};
