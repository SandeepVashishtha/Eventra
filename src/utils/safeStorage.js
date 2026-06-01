const warnedMessages = new Set();

const warnOnce = (message, error) => {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  console.warn(message, error);
};

const isBrowserStorageAvailable = (storage) => {
  if (!storage) return false;

  try {
    const testKey = "__eventra_storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    warnOnce("Storage unavailable:", error);
    return false;
  }
};

const createSafeStorage = (getStorage) => {
  const getStorageOrNull = () => {
    try {
      return getStorage();
    } catch (error) {
      warnOnce("Storage unavailable:", error);
      return null;
    }
  };

  return {
    get length() {
      try {
        return getStorageOrNull()?.length ?? 0;
      } catch (error) {
        warnOnce("Storage length unavailable:", error);
        return 0;
      }
    },

    isAvailable() {
      return isBrowserStorageAvailable(getStorageOrNull());
    },

    getItem(key, fallback = null) {
      try {
        const storage = getStorageOrNull();
        if (!storage) return fallback;
        return storage.getItem(key) ?? fallback;
      } catch (error) {
        warnOnce("Storage read unavailable:", error);
        return fallback;
      }
    },

    setItem(key, value) {
      try {
        const storage = getStorageOrNull();
        if (!storage) return false;
        storage.setItem(key, value);
        return true;
      } catch (error) {
        warnOnce("Storage write unavailable:", error);
        return false;
      }
    },

    removeItem(key) {
      try {
        const storage = getStorageOrNull();
        if (!storage) return false;
        storage.removeItem(key);
        return true;
      } catch (error) {
        warnOnce("Storage remove unavailable:", error);
        return false;
      }
    },

    clear() {
      try {
        const storage = getStorageOrNull();
        if (!storage) return false;
        storage.clear();
        return true;
      } catch (error) {
        warnOnce("Storage clear unavailable:", error);
        return false;
      }
    },

    key(index) {
      try {
        return getStorageOrNull()?.key(index) ?? null;
      } catch (error) {
        warnOnce("Storage key lookup unavailable:", error);
        return null;
      }
    },

    getJson(key, fallback = null) {
      const raw = this.getItem(key);
      if (raw == null) return fallback;

      try {
        return JSON.parse(raw);
      } catch (_) {
        // Stored values can be user-edited or corrupted; callers should keep running.
        return fallback;
      }
    },

    setJson(key, value) {
      try {
        return this.setItem(key, JSON.stringify(value));
      } catch (_) {
        return false;
      }
    },
  };
};

export const safeLocalStorage = createSafeStorage(() => {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return typeof globalThis !== "undefined" ? globalThis.localStorage : null;
});

export const safeSessionStorage = createSafeStorage(() => {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return typeof globalThis !== "undefined" ? globalThis.sessionStorage : null;
});

export const isLocalStorageAvailable = () => safeLocalStorage.isAvailable();

/**
 * Safely reads a localStorage value.
 *
 * @param {string} key
 * @param {string|null} [fallback=null]
 * @returns {string|null}
 */
export const safeGetItem = (key, fallback = null) =>
  safeLocalStorage.getItem(key, fallback);

/**
 * Safely writes a localStorage value.
 *
 * @param {string} key
 * @param {string} value
 * @returns {boolean} true when the value was stored
 */
export const safeSetItem = (key, value) => safeLocalStorage.setItem(key, value);

/**
 * Safely removes a localStorage value.
 *
 * @param {string} key
 * @returns {boolean} true when the remove operation completed
 */
export const safeRemoveItem = (key) => safeLocalStorage.removeItem(key);

/**
 * Safely clears localStorage for the current origin.
 *
 * @returns {boolean} true when localStorage was cleared
 */
export const safeClear = () => safeLocalStorage.clear();

/**
 * Returns whether localStorage can be read from and written to safely.
 *
 * @returns {boolean}
 */
export const isStorageAvailable = () => safeLocalStorage.isAvailable();

/**
 * Safely returns a localStorage key at an index.
 *
 * @param {number} index
 * @returns {string|null}
 */
export const safeKey = (index) => safeLocalStorage.key(index);

/**
 * Safely returns the localStorage key count.
 *
 * @returns {number}
 */
export const safeLength = () => safeLocalStorage.length;
