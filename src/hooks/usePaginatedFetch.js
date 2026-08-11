/**
 * usePaginatedFetch.js
 *
 * Generic data fetching hook with loading/error state, pagination,
 * AbortController cleanup, and optional retry with exponential backoff.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * 51 components duplicate the same async data fetching pattern:
 *
 *   const [data, setData]       = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError]     = useState(null);
 *
 *   const loadData = async () => {
 *     setLoading(true);
 *     try {
 *       const res = await apiUtils.get(endpoint);
 *       setData(res.data);
 *     } catch (err) {
 *       setError(err.message);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   useEffect(() => { loadData(); }, []);
 *
 * Problems with this pattern:
 *  1. No AbortController — navigating away leaves in-flight requests
 *     that call setState on unmounted components
 *  2. No retry logic — transient network errors fail permanently
 *  3. No pagination — each component re-invents page/perPage state
 *  4. No stale data — UI shows empty state during refetch instead of
 *     keeping previous data visible
 *
 * FEATURES
 * --------
 *  1. AbortController   — cancels in-flight request on unmount or refetch
 *  2. Retry             — up to maxRetries attempts with exponential backoff
 *  3. Pagination        — page, perPage, totalPages, totalElements built-in
 *  4. Stale data        — previous data shown during refetch (no flash)
 *  5. Manual refetch    — `refetch()` triggers a fresh load
 *  6. isMounted guard   — never calls setState after unmount
 *
 * USAGE
 * -----
 *   // Basic fetch
 *   const { data, isLoading, error, refetch } = usePaginatedFetch(
 *     () => apiUtils.get(API_ENDPOINTS.EVENTS.LIST),
 *     { dependencies: [eventId] }
 *   );
 *
 *   // With pagination
 *   const { data, page, totalPages, setPage } = usePaginatedFetch(
 *     (signal, page, perPage) =>
 *       apiUtils.get(`${API_ENDPOINTS.EVENTS.LIST}?page=${page}&size=${perPage}`, { signal }),
 *     { paginated: true, initialPerPage: 20 }
 *   );
 *
 *   // With retry
 *   const { data, isLoading } = usePaginatedFetch(
 *     () => apiUtils.get(API_ENDPOINTS.CONTRIBUTORS),
 *     { maxRetries: 3 }
 *   );
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { logger } from "utils/logger";

const DEFAULT_OPTIONS = {
  dependencies: [],
  initialData: null,
  initialPage: 1,
  initialPerPage: 20,
  paginated: false,
  maxRetries: 0,
  retryBaseMs: 500,
  enabled: true,
};

/**
 * usePaginatedFetch
 *
 * @param {Function} fetchFn  Async function (signal, page, perPage) → { data, ... }
 * @param {object}   options
 *
 * @returns {{
 *   data:        any,
 *   isLoading:   boolean,
 *   error:       string | null,
 *   page:        number,
 *   perPage:     number,
 *   totalPages:  number,
 *   totalElements: number,
 *   setPage:     Function,
 *   setPerPage:  Function,
 *   refetch:     Function,
 * }}
 */
const usePaginatedFetch = (fetchFn, options = {}) => {
  const {
    dependencies,
    initialData,
    initialPage,
    initialPerPage,
    paginated,
    maxRetries,
    retryBaseMs,
    enabled,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref up to date
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(async (currentPage, currentPerPage) => {
    if (!enabled) return;

    // Abort any in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isMountedRef.current) setIsLoading(true);

    let attempt = 0;
    const maxAttempts = maxRetries + 1;

    while (attempt < maxAttempts) {
      try {
        const result = await fetchFnRef.current(
          controller.signal,
          currentPage,
          currentPerPage
        );

        if (controller.signal.aborted || !isMountedRef.current) return;

        // Normalize result — support { data, totalPages, totalElements } or raw array
        const responseData = result?.data ?? result;
        const content = Array.isArray(responseData?.content)
          ? responseData.content
          : Array.isArray(responseData)
          ? responseData
          : responseData;

        setData(content);
        setError(null);
        retryCountRef.current = 0;

        if (paginated) {
          setTotalPages(responseData?.totalPages ?? 1);
          setTotalElements(responseData?.totalElements ?? responseData?.total ?? 0);
        }

        break; // Success — exit retry loop

      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;

        attempt++;

        if (attempt >= maxAttempts || !isMountedRef.current) {
          if (isMountedRef.current) {
            const message =
              err?.response?.data?.message ||
              err?.message ||
              "An unexpected error occurred.";
            setError(message);
            logger.error("[usePaginatedFetch] Fetch failed:", err);
          }
          break;
        }

        // Exponential backoff before retry
        const delay = retryBaseMs * Math.pow(2, attempt - 1);
        logger.warn(
          `[usePaginatedFetch] Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));

        if (controller.signal.aborted || !isMountedRef.current) return;
      }
    }

    if (isMountedRef.current) setIsLoading(false);
  }, [enabled, maxRetries, retryBaseMs, paginated]);

  // Trigger fetch when deps, page, or perPage change
  useEffect(() => {
    execute(page, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage, enabled, ...dependencies]);

  const refetch = useCallback(() => {
    execute(page, perPage);
  }, [execute, page, perPage]);

  return {
    data,
    isLoading,
    error,
    page,
    perPage,
    totalPages,
    totalElements,
    setPage,
    setPerPage,
    refetch,
  };
};

export default usePaginatedFetch;
