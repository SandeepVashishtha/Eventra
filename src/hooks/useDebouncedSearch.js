import { useState, useEffect, useRef } from 'react';

export const useDebouncedSearch = (searchCallback, delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const callbackRef = useRef(searchCallback);
  const latestTermRef = useRef(searchTerm);

  useEffect(() => {
    callbackRef.current = searchCallback;
  }, [searchCallback]);

  useEffect(() => {
    latestTermRef.current = searchTerm;
    const handler = setTimeout(() => {
      if (callbackRef.current) {
        callbackRef.current(latestTermRef.current);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return {
    searchTerm,
    setSearchTerm,
  };
};

export default useDebouncedSearch;
