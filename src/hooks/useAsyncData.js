/**
 * @fileoverview useAsyncData — Generic hook that prevents infinite loading states.
 *
 * Fix for Issue #8507: Broken Error Handling Causes Infinite Loading States.
 *
 * Problems solved:
 *   1. Failed requests that leave `loading = true` forever (no recovery path).
 *   2. No retry option shown to the user after a failure.
 *   3. No configurable timeout so a hung network call can trap the UI indefinitely.
 *
 * Usage:
 *   const { data, loading, error, retry } = useAsyncData(
 *     () => eventService.getAllEvents(),
 *     { timeout: 10000 }
 *   );
 */
import { useState, useCallback, useEffect, useRef } from "react";

/**
 * @template T
 * @param {() => Promise<T>} asyncFn   Async function that returns data.
 * @param {object}  [options]
 * @param {number}  [options.timeout=15000]     Ms before the request is force-failed.
 * @param {boolean} [options.immediate=true]    Run on mount.
 * @param {any[]}   [options.deps=[]]           Re-run when these values change.
 * @returns {{ data: T|null, loading: boolean, error: string|null, retry: () => void }}
 */
export function useAsyncData(asyncFn, options = {}) {
  const {
    timeout = 15_000,
    immediate = true,
    deps = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Keep a stable ref so the timeout callback doesn't close over a stale value.
  const isMounted = useRef(true);
  const asyncFnRef = useRef(asyncFn);
  useEffect(() => { asyncFnRef.current = asyncFn; });

  const execute = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    // Safety net: if the promise never settles, force-fail after `timeout` ms.
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error(`Request timed out after ${timeout / 1000}s. Check your connection and try again.`)),
        timeout
      );
    });

    try {
      const result = await Promise.race([asyncFnRef.current(), timeoutPromise]);
      if (isMounted.current) {
        setData(result);
      }
    } catch (err) {
      if (isMounted.current) {
        // Never leave loading=true on failure.
        const message =
          err?.message ||
          err?.data?.message ||
          "Something went wrong. Please try again.";
        setError(message);
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) {
        setLoading(false); // Always reset — this is the core of the fix.
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    if (immediate) execute();
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, retry: execute };
}

export default useAsyncData;