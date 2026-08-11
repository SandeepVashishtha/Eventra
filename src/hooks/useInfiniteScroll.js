import { useState, useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (fetchData, options = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const targetRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchData();
      
      // Determine content payload length across common backend response schemas
      const items = Array.isArray(response)
        ? response
        : response?.content || response?.data || response?.items || [];

      // Flag hasMore as false if an empty page array is returned
      if (!items || items.length === 0 || (response?.hasMore === false)) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || 'Error loading next page');
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, isLoading, hasMore]);

  useEffect(() => {
    // Unobserve or skip binding when there are no more items or while actively loading
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        threshold: options.threshold || 0.1,
        root: options.root || null,
        rootMargin: options.rootMargin || '0px',
      }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, isLoading, options]);

  return {
    targetRef,
    isLoading,
    hasMore,
    error,
    resetScroll: () => setHasMore(true),
  };
};

export default useInfiniteScroll;
