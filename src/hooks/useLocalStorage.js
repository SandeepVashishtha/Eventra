/**
 * @fileoverview useLocalStorage - Cross-tab synchronized localStorage hook
 * @module hooks/useLocalStorage
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { safeLocalStorage } from "../utils/safeStorage.js";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { logger } from "../utils/logger";

/**
 * A custom React hook that provides synchronized localStorage state
 * management with cross-tab update support.
 *
 * Automatically syncs state across browser tabs using storage events.
 * Prevents self-triggered updates using an internal write flag.
 *
 * @param {string} key - The localStorage key to read/write.
 * @param {*} initialValue - Default value if key doesn't exist.
 *
 * @returns {[*, Function, Function]} Tuple of:
 *   - storedValue: Current value from localStorage
 *   - setValue: Update the stored value
 *   - removeValue: Remove the key from localStorage
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
 * setTheme("dark");
 * removeTheme();
 */

const useLocalStorage = (key, initialValue) => {
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue; //sync update — always current during render

  // 🔥 FIX: Track when WE fired the event so we don't react to ourselves
  const isInternalWrite = useRef(false);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") return initialValueRef.current;

    if (!safeLocalStorage.isAvailable()) {
      return initialValueRef.current;
    }

    try {
      const item = safeLocalStorage.getItem(key);
      return safeJsonParse(item, initialValueRef.current);
    } catch (error) {
      logger.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    if (!safeLocalStorage.isAvailable()) {
      return initialValue;
    }

    try {
      const item = safeLocalStorage.getItem(key);
      return safeJsonParse(item, initialValue);
    } catch (error) {
      logger.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        if (!safeLocalStorage.isAvailable()) {
          logger.warn(`useLocalStorage: storage unavailable for key "${key}"`);
          return;
        }

        setStoredValue((currentVal) => {
          const newValue = value instanceof Function ? value(currentVal) : value;

          queueMicrotask(() => {
            const success = safeLocalStorage.setItem(key, JSON.stringify(newValue));
            if (!success) {
              logger.warn(`useLocalStorage: failed to set key "${key}"`);
            }
            isInternalWrite.current = true;
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
            }
          });

          return newValue;
        });
      } catch (error) {
        logger.warn(`useLocalStorage: error setting key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      if (!safeLocalStorage.isAvailable()) {
        logger.warn(`useLocalStorage: storage unavailable for key "${key}"`);
        return;
      }

      const success = safeLocalStorage.removeItem(key);
      if (!success) {
        logger.warn(`useLocalStorage: failed to remove key "${key}"`);
      }

      setStoredValue(initialValueRef.current);

      isInternalWrite.current = true;
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
      }
    } catch (error) {
      logger.warn(`useLocalStorage: error removing key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (event) => {
      if (isInternalWrite.current) {
        isInternalWrite.current = false;
        return;
      }

      if (event.key === key || (event.type === "local-storage" && event.detail?.key === key)) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;

export const isLocalStorageAvailable = () => {
  return safeLocalStorage.isAvailable();
};
