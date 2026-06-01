import { useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse } from "../utils/safeJsonParse.js";
import { logger } from "../utils/logger";

const useLocalStorage = (key, initialValue) => {
  const initialValueRef = useRef(initialValue);

  useEffect(()=>{
    initialValueRef.current = initialValue;
  },[initialValue]);

  // 🔥 FIX: Track when WE fired the event so we don't react to ourselves
  const isInternalWrite = useRef(false);

  const readValue = useCallback(() => {
    if (typeof window === "undefined") return initialValueRef.current;
    try {
      const item = window.localStorage.getItem(key);
      return safeJsonParse(item, initialValueRef.current);
    } catch (error) {
      logger.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState(() => {
  if (typeof window === "undefined") return initialValue;

  try {
    const item = window.localStorage.getItem(key);
    return safeJsonParse(item, initialValue);
  } catch (error) {
    console.warn(`useLocalStorage: error reading key "${key}":`, error);
    return initialValue;
  }
  });

  
  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((currentVal) => {
          const newValue = value instanceof Function ? value(currentVal) : value;

          queueMicrotask(() => {
            window.localStorage.setItem(key, JSON.stringify(newValue));
            isInternalWrite.current = true;
            window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
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
      window.localStorage.removeItem(key);
      setStoredValue(initialValueRef.current);

      // 🔥 FIX: Mark as internal before dispatching
      isInternalWrite.current = true;
      window.dispatchEvent(new CustomEvent("local-storage", { detail: { key } }));
    } catch (error) {
      logger.warn(`useLocalStorage: error removing key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      // 🔥 FIX: Skip events WE fired — they are already handled by setStoredValue
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
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};
