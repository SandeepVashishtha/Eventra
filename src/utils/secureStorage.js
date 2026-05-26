/**
 * secureStorage.js
 * Note: Client-side encryption has been removed as it provided no actual
 * XSS protection. Tokens and user data are temporarily stored in plain localStorage
 * pending a migration to backend HttpOnly cookies.
 *
 * syncSecureStorage is maintained as a plain-text pass-through wrapper to prevent
 * breaking existing imports and runtime code throughout the application.
 */

export const setToken = (token) => {
  try {
    localStorage.setItem("token", token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem("token");

    // CRITICAL: Clean up the old vulnerability!
    // Wipe the exposed key out of the browser cache if it exists from an old session.
    localStorage.removeItem("ENCRYPTION_KEY_KEY");
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const syncSecureStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('syncSecureStorage.setItem failed:', error);
      return false;
    }
  },

  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('syncSecureStorage.getItem failed:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('syncSecureStorage.removeItem failed:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('syncSecureStorage.clear failed:', error);
    }
  }
};
