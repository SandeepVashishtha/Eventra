import { useState, useCallback, useEffect, useRef } from "react";

const DEFAULT_TIMEOUT = 15_000;

function makeTimeoutPromise(ms) {
  return new Promise((_, reject) => {
    const id = setTimeout(
      () => reject(new Error(`Request timed out after ${ms / 1000}s. Check your connection and try again.`)),
      ms
    );
    // Return id so caller can clear it.
    makeTimeoutPromise._lastId = id;
  });
}

function extractMessage(err) {
  return err?.message || err?.data?.message || "Something went wrong. Please try again.";
}

/**
 * useAsyncData — prevents infinite loading states (fix for #8507).
 *
 * @param {() => Promise<any>} asyncFn
 * @param {{ timeout?: number, immediate?: boolean, deps?: any[] }} options
 * @returns {{ data: any, loading: boolean, error: string|null, retry: () => void }}
 */
export function useAsyncData(asyncFn, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, immediate = true, deps = [] } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const isMounted = useRef(true);
  const asyncFnRef = useRef(asyncFn);
  useEffect(() => { asyncFnRef.current = asyncFn; });

  const execute = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);

    const timeoutPromise = makeTimeoutPromise(timeout);
    const timeoutId = makeTimeoutPromise._lastId;

    try {
      const result = await Promise.race([asyncFnRef.current(), timeoutPromise]);
      if (isMounted.current) setData(result);
    } catch (err) {
      if (isMounted.current) setError(extractMessage(err));
    } finally {
      clearTimeout(timeoutId);
      if (isMounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    if (immediate) execute();
    return () => { isMounted.current = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, retry: execute };
}

export default useAsyncData;