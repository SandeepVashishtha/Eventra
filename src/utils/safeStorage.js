const isBrowserStorageAvailable = (storage) => {
  if (!storage) return false;

  try {
    const testKey = "__eventra_storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    // Storage is unavailable (private browsing, quota exceeded, etc.)
    return false;
  }
};

const createSafeStorage = (getStorage) => {
  const getStorageOrNull = () => {
    try {
      return getStorage();
    } catch (error) {
      // Storage access failed (might be disabled, in private mode, or SSR context)
      return null;
    }
  };

  return {
    get length() {
      try {
        return getStorageOrNull()?.length ?? 0;
      } catch (error) {
        return 0;
      }
    },

    isAvailable() {
      return isBrowserStorageAvailable(getStorageOrNull());
    },

    getItem(key, fallback = null) {
      if (!key) return fallback;
      try {
        return getStorageOrNull()?.getItem(key) ?? fallback;
      } catch (error) {
        // Storage unavailable or key inaccessible
        return fallback;
      }
    },

    setItem(key, value) {
      if (!key) return false;
      try {
        const storage = getStorageOrNull();
        if (storage) {
          storage.setItem(key, value);
          return true;
        }
        return false;
      } catch (error) {
        // Storage full (QuotaExceededError) or unavailable
        return false;
      }
    },

    removeItem(key) {
      if (!key) return false;
      try {
        const storage = getStorageOrNull();
        if (storage) {
          storage.removeItem(key);
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },

    clear() {
      try {
        const storage = getStorageOrNull();
        if (storage) {
          storage.clear();
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    },

    key(index) {
      try {
        return getStorageOrNull()?.key(index) ?? null;
      } catch (error) {
        return null;
      }
    },

    getJson(key, fallback = null) {
      const raw = this.getItem(key);
      if (raw == null) return fallback;

      try {
        return JSON.parse(raw);
      } catch (error) {
        // Stored values can be user-edited or corrupted; callers should keep running.
        return fallback;
      }
    },

    setJson(key, value) {
      try {
        return this.setItem(key, JSON.stringify(value));
      } catch (error) {
        // JSON serialization failed or storage error
        return false;
      }
    },
  };
};

export const safeLocalStorage = createSafeStorage(() =>
  typeof window !== "undefined" ? window.localStorage : null
);

export const safeSessionStorage = createSafeStorage(() =>
  typeof window !== "undefined" ? window.sessionStorage : null
);

export const isLocalStorageAvailable = () => safeLocalStorage.isAvailable();
export const isSessionStorageAvailable = () => safeSessionStorage.isAvailable();

// Helper to safely get a value with fallback, handles both JSON and string values
export const getStorageValue = (key, fallback = null, type = "string") => {
  if (!safeLocalStorage.isAvailable()) return fallback;

  try {
    if (type === "json") {
      return safeLocalStorage.getJson(key, fallback);
    }
    return safeLocalStorage.getItem(key, fallback);
  } catch (error) {
    return fallback;
  }
};

// Helper to safely set a value
export const setStorageValue = (key, value, type = "string") => {
  if (!safeLocalStorage.isAvailable()) return false;

  try {
    if (type === "json") {
      return safeLocalStorage.setJson(key, value);
    }
    return safeLocalStorage.setItem(key, String(value));
  } catch (error) {
    return false;
  }
};

// Helper to safely remove a value
export const removeStorageValue = (key) => {
  if (!safeLocalStorage.isAvailable()) return false;

  try {
    return safeLocalStorage.removeItem(key);
  } catch (error) {
    return false;
  }
};

// Export createSafeStorage for custom storage implementations
export { createSafeStorage };
