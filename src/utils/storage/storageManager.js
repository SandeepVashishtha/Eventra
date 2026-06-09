 
import { STORAGE_KEYS } from "./storageKeys";
import { validators } from "./storageValidators";
import { safeJsonParse } from "../../utils/safeJsonParse";
import { logger } from "../logger";

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
      logger.error(`Storage set error for ${key}:`, error);
    }
  },

  get(key, validator = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = safeJsonParse(raw, {});

      // 1. Check for expected structure
      if (!parsed || typeof parsed !== 'object' || !('value' in parsed)) {
        logger.warn(`[Storage] Invalid structure for key: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      // 2. Check for expiry (This is expected behavior)
      if (parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      // 3. Optional validation
      if (validator && !validator(parsed.value)) {
        logger.warn(`[Storage] Validation failed for key: ${key}`);
        localStorage.removeItem(key);
        return null;
      }

      return parsed.value;
    } catch (error) {
      // 4. Detailed logging instead of silent deletion
      logger.error(`[Storage] Corruption error for key "${key}":`, error);
      
      // Only remove if it's a parse error (definitely corrupted)
      if (error instanceof SyntaxError) {
        logger.warn(`[Storage] Removing corrupted key: ${key}`);
        localStorage.removeItem(key);
      }
      return null;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Storage remove error for ${key}:`, error);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error("Storage clear error:", error);
    }
  },
};

export { STORAGE_KEYS, validators };
