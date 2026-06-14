import { useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { logger } from "../utils/logger";

const useSessionStorage = (key, initialValue) => {
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  const isInternalWrite = useRef(false);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") return initialValueRef.current;
    try {
      const item = window.sessionStorage.getItem(key);
      return safeJsonParse(item, initialValueRef.current);
    } catch (error) {
      logger.warn(`useSessionStorage: error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.sessionStorage.getItem(key);
      return safeJsonParse(item, initialValue);
    } catch (error) {
      console.warn(`useSessionStorage: error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((currentVal) => {
          const newValue = value instanceof Function ? value(currentVal) : value;

          queueMicrotask(() => {
            window.sessionStorage.setItem(key, JSON.stringify(newValue));
            isInternalWrite.current = true;
            window.dispatchEvent(new CustomEvent("session-storage", { detail: { key } }));
          });

          return newValue;
        });
      } catch (error) {
        logger.warn(`useSessionStorage: error setting key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValueRef.current);

      isInternalWrite.current = true;
      window.dispatchEvent(new CustomEvent("session-storage", { detail: { key } }));
    } catch (error) {
      logger.warn(`useSessionStorage: error removing key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (isInternalWrite.current) {
        isInternalWrite.current = false;
        return;
      }

      if (event.key === key || (event.type === "session-storage" && event.detail?.key === key)) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("session-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("session-storage", handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
};

export default useSessionStorage;
