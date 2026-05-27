import { useState, useEffect, useCallback, useRef } from "react";

const useLocalStorage = (key, initialValue) => {
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const readValue = useCallback(() => {
    if (typeof window === "undefined") return initialValueRef.current;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValueRef.current;
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key]);

  const [storedValue, setStoredValue] = useState(readValue);

  const storedValueRef = useRef(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  const setValue = useCallback(
    (value) => {
      try {
        const newValue = value instanceof Function ? value(storedValueRef.current) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        // Notify other hook instances with the same key (cross-tab sync)
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`useLocalStorage: error setting key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValueRef.current);
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`useLocalStorage: error removing key "${key}":`, error);
    }
  }, [key]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key || event.type === "local-storage") {
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