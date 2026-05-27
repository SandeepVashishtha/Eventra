import { STORAGE_KEYS } from "./storageKeys";
import { validators } from "./storageValidators";

const DEFAULT_EXPIRY = 1000 * 60 * 60; // 1 hour

export const storageManager = {
  set(key, value, expiry = DEFAULT_EXPIRY) {
    try {
      const payload = {
        value,
        expiry: Date.now() + expiry,
        version: 1,
      };

      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error(`Storage set error for ${key}:`, error);
    }
  },

  get(key, validator = null) {
    try {
      const raw = localStorage.getItem(key);

      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (!parsed?.value) {
        localStorage.removeItem(key);
        return null;
      }

      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      if (validator && !validator(parsed.value)) {
        console.warn(`Validation failed for storage key: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Storage get error for ${key}:`, error);
      localStorage.removeItem(key);
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage remove error for ${key}:`, error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Storage clear error:", error);
    }
  },
};

export { STORAGE_KEYS, validators };