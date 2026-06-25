import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle repetitive fetch calls with loading and error states.
 * @param {string} url - The URL to fetch.
 * @param {object} options - Fetch options (method, headers, etc.).
 * @returns {object} { data, loading, error, refetch }
 */
export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const stringifiedOptions = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, JSON.parse(stringifiedOptions));
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  }, [url, stringifiedOptions]);

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData, url]);

  return { data, loading, error, refetch: fetchData };
}
