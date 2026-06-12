const isBrowserStorageAvailable = (storage) => {
  if (!storage) return false;

  try {
    const testKey = "__eventra_storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (_) {
    return false;
  }
};

const createSafeStorage = (getStorage) => {
  const getStorageOrNull = () => {
    try {
      return getStorage();
    } catch (_) {
      return null;
    }
  };

  return {
    get length() {
      try {
        return getStorageOrNull()?.length ?? 0;
      } catch (_) {
        return 0;
      }
    },

    isAvailable() {
      return isBrowserStorageAvailable(getStorageOrNull());
    },

    getItem(key, fallback = null) {
      try {
        return getStorageOrNull()?.getItem(key) ?? fallback;
      } catch (_) {
        return fallback;
      }
    },

    setItem(key, value) {
      try {
        getStorageOrNull()?.setItem(key, value);
        return true;
      } catch (_) {
        return false;
      }
    },

    removeItem(key) {
      try {
        getStorageOrNull()?.removeItem(key);
        return true;
      } catch (_) {
        return false;
      }
    },

    clear() {
      try {
        getStorageOrNull()?.clear();
        return true;
      } catch (_) {
        return false;
      }
    },

    key(index) {
      try {
        return getStorageOrNull()?.key(index) ?? null;
      } catch (_) {
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

export const safeLocalStorage = createSafeStorage(() =>
  typeof window !== "undefined" ? window.localStorage : null
);

export const safeSessionStorage = createSafeStorage(() =>
  typeof window !== "undefined" ? window.sessionStorage : null
);

export const isLocalStorageAvailable = () => safeLocalStorage.isAvailable();


