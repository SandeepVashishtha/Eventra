import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage
 *
 * A drop-in replacement for `useState` that automatically persists the value
 * to `localStorage` and stays in sync across multiple hook instances using
 * the same key (via the `storage` event).
 *
 * @param {string} key        - The localStorage key to read/write.
 * @param {*}      initialValue - Default value if the key is not yet set.
 * @returns {[*, Function, Function]} [storedValue, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * setTheme('dark');          // updates state AND localStorage
 * removeValue();             // removes the key and resets to initialValue
 */
const useLocalStorage = (key, initialValue) => {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      try {
        // Support functional updates just like useState
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        // Notify other hook instances with the same key (cross-tab sync)
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`useLocalStorage: error setting key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.warn(`useLocalStorage: error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Keep in sync with other tabs / windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key || event.type === 'local-storage') {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
