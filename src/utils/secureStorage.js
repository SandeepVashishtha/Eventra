/**
 * secureStorage.js
 * * Note: Client-side encryption has been removed as it provided no actual
 * XSS protection. Tokens are temporarily stored in plain localStorage
 * pending a migration to backend HttpOnly cookies.
 */

export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");

  // CRITICAL: Clean up the old vulnerability!
  // Wipe the exposed key out of the browser cache if it exists from an old session.
  // Using the exact key name from your screenshot.
  localStorage.removeItem("ENCRYPTION_KEY_KEY");
};

export const syncSecureStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
};
