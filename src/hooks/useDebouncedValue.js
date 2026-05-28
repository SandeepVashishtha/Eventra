/**
 * useDebouncedValue
 *
 * Returns a debounced copy of `value` that only updates after the user has
 * stopped changing it for `delayMs` milliseconds.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The event search input previously called `setSearchQuery` on every
 * keystroke via an `onChange` handler, which triggered the full filter +
 * sort + fuzzy-search pipeline in `useEventListing` on every character
 * typed. Fuse.js fuzzy search across hundreds of event objects with a 0.35
 * threshold is not a free operation — on a mid-range device this produces
 * visible jank while the user is still mid-word.
 *
 * Debouncing delays the expensive downstream computation until the input has
 * been idle for `delayMs` (default 300 ms). The visible input field still
 * updates synchronously on every keystroke (controlled by the caller's local
 * state), so the UI feels instant — only the search pipeline waits.
 *
 * USAGE
 * ─────
 * const [inputValue, setInputValue] = useState("");
 * const debouncedValue = useDebouncedValue(inputValue, 300);
 *
 * // Pass inputValue to the <input> so it appears immediately.
 * // Pass debouncedValue to the search/filter pipeline.
 *
 * @param {*}      value    - The value to debounce (typically a string)
 * @param {number} [delayMs=300] - Idle period in milliseconds before the
 * debounced value is updated
 * @returns {*} The debounced value
 */

import { useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedValue(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * useDebouncedCallback
 *
 * Returns a stable debounced wrapper around `callback`. The wrapped function
 * is safe to pass directly to event handlers — the timeout is reset on every
 * call and only fires once the idle period has elapsed.
 *
 * Unlike `useDebouncedValue`, this variant is useful when the caller wants to
 * debounce a side-effect function (e.g. a state setter) rather than a value.
 *
 * @param {function} callback - The function to debounce
 * @param {number}   [delayMs=300]
 * @returns {function} Debounced version of `callback`
 */

export function useDebouncedCallback(callback, delayMs = 300) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);

  // Keep the ref current so the debounced wrapper always calls the latest
  // version of `callback` without needing to be recreated on every render.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // 🔥 FIX: Clean up the timeout if the component unmounts before the delay finishes.
  // Without this, the callback will execute on an unmounted component, causing a memory leak.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delayMs);
    },
    [delayMs]
  );
}

/**
 * useDebouncedSearch
 *
 * Convenience hook that pairs a local input value with a debounced search
 * term. Returns three values:
 * - `inputValue`   — the current (immediate) value, bind to `<input value>`
 * - `searchTerm`   — the debounced value, pass to the search/filter pipeline
 * - `setInputValue` — the setter, bind to `<input onChange>`
 *
 * Callers that were previously doing:
 *
 * onChange={(e) => listing.setSearchQuery(e.target.value)}
 *
 * can now do:
 *
 * const { inputValue, searchTerm, setInputValue } = useDebouncedSearch(
 * listing.searchQuery, 300
 * );
 * // <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
 * // Use searchTerm as the prop passed to the filtering hook.
 *
 * @param {string} initialValue
 * @param {number} [delayMs=300]
 * @returns {{ inputValue: string, searchTerm: string, setInputValue: function }}
 */
export function useDebouncedSearch(initialValue = "", delayMs = 300) {
  const [inputValue, setInputValue] = useState(initialValue);
  const searchTerm = useDebouncedValue(inputValue, delayMs);

  return { inputValue, searchTerm, setInputValue };
}