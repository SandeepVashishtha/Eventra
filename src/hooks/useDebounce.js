import { useState, useEffect } from "react";

/**
 * Custom hook to debounce value changes.
 * @param {any} value The value to debounce.
 * @param {number} delay The debounce delay in milliseconds.
 * @returns {any} The debounced value.
 */
export default function useDebounce(value, delay = 300) {
  const safeDelay = typeof delay === 'number' && isFinite(delay) && delay > 0 ? delay : 300;
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, safeDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, safeDelay]);

  return debouncedValue;
}
