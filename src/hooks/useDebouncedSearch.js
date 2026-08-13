import { useCallback, useEffect, useRef, useState } from "react";

export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setIsDebouncing(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsDebouncing(false);
      timerRef.current = null;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = null;
    };
  }, [searchTerm, delay]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = null;
    setSearchTerm('');
    setDebouncedTerm('');
    setIsDebouncing(false);
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
