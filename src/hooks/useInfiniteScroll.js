/**
 * useInfiniteScroll.js
 *
 * IntersectionObserver-based infinite scroll hook that replaces
 * eager while-loop page fetching with scroll-triggered loading.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * Three components used a blocking while-loop to eagerly fetch all pages:
 *
 *   Contributors.js         — while (hasMore && page <= MAX_PAGES) { fetch... }
 *   ContributorsCarousel.js — while (hasMore && page <= MAX_PAGES) { fetch... }
 *   EventDetails.js         — while (hasMore) { fetch... } — TWO separate loops
 *
 * Problems:
 *  1. Blocks rendering — all pages fetched synchronously in the component's
 *     mount effect before any results are shown to the user
 *  2. No scroll trigger — fetches page 2, 3, 4... even if user never scrolls
 *  3. No loading indicator between pages — UI frozen until all pages done
 *  4. No AbortController — navigating away leaves all in-flight page requests
 *
 * FEATURES
 * --------
 *  1. IntersectionObserver  — triggers next page load when sentinel element
 *                             enters the viewport (scroll-triggered loading)
 *  2. Initial page          — loads page 1 immediately on mount
 *  3. isLoadingMore         — distinct from initial isLoading for UI feedback
 *  4. hasMore               — derived from whether last fetch returned data
 *  5. AbortController       — cancels in-flight requests on unmount
 *  6. isMounted guard       — never sets state after unmount
 *  7. Deduplication         — ignores sentinel observation during active fetch
 *  8. reset()               — restart from page 1 (e.g. on filter change)
 *
 * USAGE
 * -----
 *   // fetchPage(page, signal) → Promise<{ items: T[], hasMore: boolean }>
 *   const { data, isLoading, isLoadingMore, hasMore, sentinelRef, reset } =
 *     useInfiniteScroll(fetchPage, { threshold: 0.5 });
 *
 *   return (
 *     <ul>
 *       {data.map(item => <li key={item.id}>{item.name}</li>)}
 *       {/* Sentinel — IntersectionObserver watches this element *}
 *       <li ref={sentinelRef} aria-hidden="true" />
 *       {isLoadingMore && <Spinner />}
 *     </ul>
 *   );
 */

import { useState, useEffect, useRef, useCallback } from "react";

const DEFAULT_OPTIONS = {
  threshold:    0.1,   // how much of sentinel must be visible to trigger load
  rootMargin:   "0px", // margin around viewport root
  initialPage:  1,
  enabled:      true,
};

/**
 * useInfiniteScroll
 *
 * @param {Function} fetchPage
 *   Async function (page: number, signal: AbortSignal) → { items: any[], hasMore: boolean }
 *   Return `{ items: [], hasMore: false }` when there are no more pages.
 *
 * @param {object} [options]
 * @param {number}  [options.threshold=0.1]   IntersectionObserver threshold
 * @param {string}  [options.rootMargin="0px"] IntersectionObserver rootMargin
 * @param {number}  [options.initialPage=1]    First page number to load
 * @param {boolean} [options.enabled=true]     Skip loading when false
 *
 * @returns {{
 *   data:          any[],
 *   isLoading:     boolean,   initial load
 *   isLoadingMore: boolean,   subsequent page loads
 *   hasMore:       boolean,
 *   error:         string | null,
 *   sentinelRef:   React.RefObject,
 *   reset:         () => void,
 *   refetch:       () => void,
 * }}
 */
const useInfiniteScroll = (fetchPage, options = {}) => {
  const { threshold, rootMargin, initialPage, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const pageRef = useRef(initialPage);
  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);
  const fetchPageRef = useRef(fetchPage);

  useEffect(() => { fetchPageRef.current = fetchPage; }, [fetchPage]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // ── Fetch a single page ───────────────────────────────────────────────────
  const loadPage = useCallback(async (page, isInitial = false) => {
    if (isFetchingRef.current || !enabled) return;
    isFetchingRef.current = true;

    // Abort previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (isInitial) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await fetchPageRef.current(page, controller.signal);

      if (controller.signal.aborted || !isMountedRef.current) return;

      const items = result?.items ?? result?.data ?? (Array.isArray(result) ? result : []);
      const more = result?.hasMore ?? items.length > 0;

      setData((prev) => (isInitial ? items : [...prev, ...items]));
      setHasMore(more);
      setError(null);
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (isMountedRef.current) {
        setError(err?.message || "Failed to load more items.");
        setHasMore(false);
      }
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
      isFetchingRef.current = false;
    }
  }, [enabled]);

  // ── Load initial page on mount / when enabled changes ────────────────────
  useEffect(() => {
    if (!enabled) return;
    pageRef.current = initialPage;
    loadPage(initialPage, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, initialPage]);

  // ── IntersectionObserver — triggers next page ─────────────────────────────
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === "undefined") return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          const nextPage = pageRef.current + 1;
          pageRef.current = nextPage;
          loadPage(nextPage, false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, threshold, rootMargin, loadPage]);

  // ── reset — restart from page 1 ──────────────────────────────────────────
  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    isFetchingRef.current = false;
    pageRef.current = initialPage;
    setData([]);
    setHasMore(true);
    setError(null);
    loadPage(initialPage, true);
  }, [initialPage, loadPage]);

  // ── refetch — reload current page 1 without clearing data ────────────────
  const refetch = useCallback(() => {
    isFetchingRef.current = false;
    pageRef.current = initialPage;
    loadPage(initialPage, true);
  }, [initialPage, loadPage]);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    sentinelRef,
    reset,
    refetch,
  };
};

export default useInfiniteScroll;
