import { STORAGE_KEYS } from "./storageKeys.js";
import { validators } from "./storageValidators.js";
import { safeJsonParse } from "../../utils/safeJsonParse.js";
import { logger } from "../logger.js";

const DEFAULT_EXPIRY = 1000 * 60 * 60; // 1 hour

const getStorage = () => {
  if (typeof globalThis !== "undefined" && globalThis.localStorage) {
    return globalThis.localStorage;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
};

export const storageManager = {
  set(key, value, expiry = DEFAULT_EXPIRY) {
    const storage = getStorage();
    if (!storage) {
      return;
    }
    try {
      const payload = {
        value,
        expiry: Date.now() + expiry,
        version: 1,
      };

      storage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      logger.error(`Storage set error for ${key}:`, error);
    }
  },

  get(key, validator = null) {
    const storage = getStorage();
    if (!storage) {
      return null;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;

      const parsed = safeJsonParse(raw, {});

      // 1. Check for expected structure
      if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) {
        logger.warn(`[Storage] Invalid structure for key: ${key}`);
        storage.removeItem(key);
        return null;
      }

      // 2. Check for expiry (This is expected behavior)
      if (parsed.expiry && Date.now() > parsed.expiry) {
        storage.removeItem(key);
        return null;
      }

      // 3. Optional validation
      if (validator && !validator(parsed.value)) {
        logger.warn(`[Storage] Validation failed for key: ${key}`);
        storage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      // safeJsonParse never re-throws SyntaxError — only localStorage access
      // errors (SecurityError, QuotaExceededError) reach here. Log and return
      // null; do not attempt removeItem since the access error would repeat.
      logger.error(`[Storage] Access error for key "${key}":`, error);
      return null;
    }
  },
  
  remove(key) {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch (error) {
      logger.error(`Storage remove error for ${key}:`, error);
    }
  },

  clear() {
    const storage = getStorage();
    if (!storage) return;
    try {
      storage.clear();
    } catch (error) {
      logger.error("Storage clear error:", error);
    }
  },
};

export { STORAGE_KEYS, validators };
