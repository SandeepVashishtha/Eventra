/**
 * Resilient Web Storage Engine with In-Memory Fallback & TTL Support
 *
 * Provides a unified, safe wrapper around window.localStorage and window.sessionStorage.
 * Handles SSR environments, Safari Private Browsing restrictions, quota limits,
 * JSON serialization errors, and optional TTL key expiration.
 */

// ============================================================================
// 1. In-Memory Fallback Storage Driver
// ============================================================================

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  get length() {
    return this.store.size;
  }

  getItem(key) {
    return this.store.has(String(key)) ? this.store.get(String(key)) : null;
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  removeItem(key) {
    this.store.delete(String(key));
  }

  clear() {
    this.store.clear();
  }

  key(index) {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

// Global in-memory fallbacks for SSR or restricted browser environments
const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

// ============================================================================
// 2. Storage Availability Diagnostics
// ============================================================================

/**
 * Validates whether a storage provider is functional by testing write and delete operations.
 *
 * @param {Storage|Object} storage - Storage object to test.
 * @returns {boolean} True if write/remove operations succeed without throwing.
 */
export const isBrowserStorageAvailable = (storage) => {
  if (!storage) return false;

  try {
    const testKey = "__eventra_storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// 3. Core Safe Storage Factory
// ============================================================================

/**
 * Creates a safe, resilient storage wrapper with automatic in-memory fallback.
 *
 * @param {Function} getStorage - Function returning target Web Storage instance.
 * @param {MemoryStorage} memoryFallback - Fallback storage instance.
 * @param {string} [prefix="eventra_"] - Namespace prefix for keys to prevent collision.
 */
export const createSafeStorage = (getStorage, memoryFallback, prefix = "") => {
  const getStorageOrNull = () => {
    try {
      const storage = getStorage();
      return isBrowserStorageAvailable(storage) ? storage : null;
    } catch (_) {
      return null;
    }
  };

  const getActiveStorage = () => getStorageOrNull() || memoryFallback;

  const prefixedKey = (key) => `${prefix}${key}`;

  return {
    /**
     * Total items currently held in storage.
     * @type {number}
     */
    get length() {
      try {
        return getActiveStorage().length;
      } catch (_) {
        return 0;
      }
    },

    /**
     * Checks if native browser storage is currently operational (non-fallback).
     * @returns {boolean}
     */
    isAvailable() {
      return getStorageOrNull() !== null;
    },

    /**
     * Retrieves a raw string item by key.
     *
     * @param {string} key - Target key name.
     * @param {string|null} [fallback=null] - Value returned on failure or missing key.
     * @returns {string|null}
     */
    getItem(key, fallback = null) {
      try {
        const val = getActiveStorage().getItem(prefixedKey(key));
        return val ?? fallback;
      } catch (_) {
        return fallback;
      }
    },

    /**
     * Sets a raw string value.
     *
     * @param {string} key - Target key.
     * @param {string} value - String payload.
     * @returns {boolean} True if operation succeeded.
     */
    setItem(key, value) {
      try {
        getActiveStorage().setItem(prefixedKey(key), String(value));
        return true;
      } catch (err) {
        // Attempt eviction on QuotaExceededError if operating on native storage
        if (err.name === "QuotaExceededError" || err.code === 22) {
          console.warn("[SafeStorage] Quota exceeded. Falling back to memory driver.");
          memoryFallback.setItem(prefixedKey(key), String(value));
          return true;
        }
        return false;
      }
    },

    /**
     * Removes an item by key.
     *
     * @param {string} key - Target key.
     * @returns {boolean}
     */
    removeItem(key) {
      try {
        getActiveStorage().removeItem(prefixedKey(key));
        memoryFallback.removeItem(prefixedKey(key));
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Clears all stored keys in this storage namespace.
     * @returns {boolean}
     */
    clear() {
      try {
        getActiveStorage().clear();
        memoryFallback.clear();
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Retrieves key name by index.
     *
     * @param {number} index - Key index position.
     * @returns {string|null}
     */
    key(index) {
      try {
        const rawKey = getActiveStorage().key(index);
        if (!rawKey) return null;
        return prefix && rawKey.startsWith(prefix) ? rawKey.slice(prefix.length) : rawKey;
      } catch (_) {
        return null;
      }
    },

    /**
     * Safe JSON retrieval with corrupt payload fallback handling.
     *
     * @template T
     * @param {string} key - Target key.
     * @param {T} [fallback=null] - Default value on missing or corrupt JSON.
     * @returns {T}
     */
    getJson(key, fallback = null) {
      const raw = this.getItem(key);
      if (raw === null) return fallback;

      try {
        return JSON.parse(raw);
      } catch (_) {
        console.warn(`[SafeStorage] Corrupt JSON payload at key: "${key}". Returning fallback.`);
        return fallback;
      }
    },

    /**
     * Serializes value to JSON and stores it.
     *
     * @param {string} key - Target key.
     * @param {unknown} value - Data to serialize.
     * @returns {boolean}
     */
    setJson(key, value) {
      try {
        return this.setItem(key, JSON.stringify(value));
      } catch {
        return false;
      }
    },

    /**
     * Stores JSON data with a mandatory Time-To-Live (TTL) expiration window.
     *
     * @param {string} key - Target key.
     * @param {unknown} value - Payload.
     * @param {number} ttlMs - Duration in milliseconds before expiration.
     * @returns {boolean}
     */
    setWithExpiry(key, value, ttlMs) {
      const record = {
        data: value,
        expiry: Date.now() + ttlMs,
      };
      return this.setJson(key, record);
    },

    /**
     * Retrieves JSON item only if TTL has not elapsed. Automatically purges expired items.
     *
     * @template T
     * @param {string} key - Target key.
     * @param {T} [fallback=null] - Fallback returned if expired or missing.
     * @returns {T}
     */
    getWithExpiry(key, fallback = null) {
      const record = this.getJson(key, null);
      if (!record || typeof record !== "object" || !("expiry" in record)) {
        return fallback;
      }

      if (Date.now() > record.expiry) {
        this.removeItem(key);
        return fallback;
      }

      return record.data;
    },

    /**
     * Estimates approximate storage space consumed in kilobytes (KB).
     * @returns {number} Storage footprint in KB.
     */
    getBytesUsed() {
      try {
        const target = getActiveStorage();
        let totalBytes = 0;
        for (let i = 0; i < target.length; i++) {
          const k = target.key(i);
          if (k) {
            const v = target.getItem(k);
            totalBytes += (k.length + (v ? v.length : 0)) * 2; // UTF-16 characters = 2 bytes
          }
        }
        return Number((totalBytes / 1024).toFixed(2));
      } catch (_) {
        return 0;
      }
    },

    /**
     * Attaches cross-tab storage change listener for specified key.
     *
     * @param {string} key - Key to monitor.
     * @param {Function} callback - Triggered when value changes in another tab.
     * @returns {Function} Unsubscribe function.
     */
    onStorageChange(key, callback) {
      if (typeof window === "undefined") return () => {};

      const handler = (event) => {
        if (event.key === prefixedKey(key)) {
          let newValue = event.newValue;
          try {
            newValue = JSON.parse(event.newValue);
          } catch (_) {}
          callback(newValue, event.oldValue);
        }
      };

      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
};

// ============================================================================
// 4. Default Exports & Instance Bindings
// ============================================================================

export const safeLocalStorage = createSafeStorage(
  () => (typeof window !== "undefined" ? window.localStorage : null),
  memoryLocalStorage,
  "eventra_"
);

export const safeSessionStorage = createSafeStorage(
  () => (typeof window !== "undefined" ? window.sessionStorage : null),
  memorySessionStorage,
  "eventra_"
);

export const isLocalStorageAvailable = () => safeLocalStorage.isAvailable();
export const isSessionStorageAvailable = () => safeSessionStorage.isAvailable();

export default safeLocalStorage;