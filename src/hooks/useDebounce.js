/**
 * Custom hook to debounce a value by the specified delay.
 *
 * Returns the latest value that has been stable for at least `delay` ms.
 * Each time `value` changes the timer resets; the debounced value only
 * updates after the delay elapses without another change.
 *
 * Invalid `delay` values (non-finite, non-positive, or non-number) fall
 * back to 300 ms.
 *
 * @param {any}    value       - The value to debounce.
 * @param {number} [delay=300] - Debounce window in milliseconds.
 * @returns {any} The debounced value.
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 500);
 * useEffect(() => { fetchResults(debouncedQuery); }, [debouncedQuery]);
 */

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
