import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for debounced search/filter queries.
 * Prevents excessive re-renders and API calls by debouncing input changes.
 * 
 * @param {string} initialValue - Initial search value
 * @param {number} delay - Debounce delay in milliseconds (default: 300ms)
 * @returns {{ searchTerm, debouncedTerm, setSearchTerm, isDebouncing, clear }}
 */
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useRef(null);
  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (searchTerm === debouncedTerm) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);

    timerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsDebouncing(false);
    }, delayRef.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [searchTerm]);

  const clear = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
    setIsDebouncing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    searchTerm,
    debouncedTerm,
    setSearchTerm,
    isDebouncing,
    clear,
  };
}

export default useDebouncedSearch;
