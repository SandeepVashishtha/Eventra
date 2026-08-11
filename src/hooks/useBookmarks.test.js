import { useState, useCallback } from 'react';

export const useBookmark = (initialState = false, hackathonId, apiEndpoint = '/api/bookmarks') => {
  const [isBookmarked, setIsBookmarked] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleBookmark = useCallback(async () => {
    // 1. Capture the previous state for potential rollback
    const previousState = isBookmarked;
    const optimisticState = !previousState;

    // 2. Apply optimistic UI update immediately
    setIsBookmarked(optimisticState);
    setError(null);

    // 3. Perform network request
    try {
      setIsLoading(true);
      const response = await fetch(apiEndpoint, {
        method: optimisticState ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hackathonId }),
      });

      if (!response.ok) {
        throw new Error('Server rejected the bookmark update');
      }
      
      // Success! The optimistic state is confirmed by the server.
    } catch (err) {
      // 4. Rollback to previous state on failure
      setIsBookmarked(previousState);
      setError(err.message || 'Failed to toggle bookmark. Reverting changes.');
    } finally {
      setIsLoading(false);
    }
  }, [isBookmarked, hackathonId, apiEndpoint]);

  return {
    isBookmarked,
    toggleBookmark,
    isLoading,
    error,
  };
};

export default useBookmark;
