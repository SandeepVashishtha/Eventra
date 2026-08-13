/**
 * useSearch.js
 *
 * Unified search hook combining URL sync, debouncing, input sanitization,
 * and search history. Replaces 3 overlapping debounce hooks and 10+ raw
 * useDebounce usages that skip sanitization.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * Three overlapping debounce hooks existed:
 *
 *   useDebounce.js        — bare value debounce, no sanitization
 *   useDebouncedSearch.js — adds sanitization but no URL sync
 *   useDebouncedValue.js  — adds convenience but duplicates useDebouncedSearch
 *
 * 10+ components used useDebounce directly for search:
 *
 *   SearchFilter.js     — useDebounce + manual URL sync + manual popstate
 *   CollaborationHub.js — useDebounce, no sanitization, no URL sync
 *   ProjectsPage.js     — useDebounce, no sanitization, no URL sync
 *   useEventListing.js  — useDebounce (400ms), sanitizes separately
 *   HackathonPage.js    — reads from sessionStorage + URL manually
 *   ContributorsCarousel— raw state, no debounce at all
 *
 * Problems:
 *  1. No sanitization in 4 of 6 callers — XSS via search input
 *  2. URL sync re-implemented manually in every component
 *  3. Back button doesn't restore search — `window.history.replaceState`
 *     used instead of React Router's `useSearchParams`
 *  4. No search history — "recent searches" re-implemented in Contributors
 *  5. Inconsistent debounce delays — 300ms, 400ms, 500ms used in same app
 *
 * FEATURES
 * --------
 *  1. Input sanitization  — strips XSS via prepareSafeSearchQuery
 *  2. Debounce            — configurable delay (default 300ms)
 *  3. URL sync            — reads/writes `?q=` param via useSearchParams
 *  4. Search history      — last N searches stored in sessionStorage
 *  5. isSearching         — true while debounce is pending (for loading spinner)
 *  6. clear()             — resets query, URL param, and debounced value
 *
 * USAGE
 * -----
 *   const {
 *     query,          // current input value (for <input value={query}>)
 *     debouncedQuery, // use this for filtering/API calls
 *     isSearching,    // true while debounce is pending
 *     history,        // recent searches array
 *     setQuery,       // update the search input
 *     clear,          // clear everything
 *   } = useSearch({ urlParam: "q", debounceMs: 300, historySize: 5 });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { prepareSafeSearchQuery } from "utils/inputSanitization";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const readHistory = (storageKey) => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
};

const writeHistory = (storageKey, term, maxSize) => {
  if (!term?.trim() || typeof window === "undefined") return;
  try {
    const existing = readHistory(storageKey);
    const updated = [term, ...existing.filter((t) => t !== term)].slice(0, maxSize);
    sessionStorage.setItem(storageKey, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  urlParam:    "q",
  debounceMs:  300,
  historySize: 5,
  historyKey:  "eventra:search-history",
  syncUrl:     true,
  sanitize:    true,
};

/**
 * useSearch
 *
 * @param {object} [options]
 * @param {string}  [options.urlParam="q"]       URL search param name
 * @param {number}  [options.debounceMs=300]      Debounce delay in ms
 * @param {number}  [options.historySize=5]       Max recent searches to keep
 * @param {string}  [options.historyKey]          sessionStorage key for history
 * @param {boolean} [options.syncUrl=true]        Sync query to URL params
 * @param {boolean} [options.sanitize=true]       Sanitize input via prepareSafeSearchQuery
 *
 * @returns {{
 *   query:          string,
 *   debouncedQuery: string,
 *   isSearching:    boolean,
 *   history:        string[],
 *   setQuery:       (value: string) => void,
 *   clear:          () => void,
 * }}
 */
const useSearch = (options = {}) => {
  const {
    urlParam,
    debounceMs,
    historySize,
    historyKey,
    syncUrl,
    sanitize,
  } = { ...DEFAULT_OPTIONS, ...options };

  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState(() => readHistory(historyKey));

  // Initialize from URL param on mount
  const initialQuery = syncUrl ? (searchParams.get(urlParam) || "") : "";
  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(
    sanitize ? prepareSafeSearchQuery(initialQuery) : initialQuery
  );
  const [isSearching, setIsSearching] = useState(false);

  const timerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Sync URL → query when URL changes externally (back/forward nav) ───────
  useEffect(() => {
    if (!syncUrl) return;
    const urlQuery = searchParams.get(urlParam) || "";
    if (urlQuery !== query) {
      setQueryState(urlQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, urlParam, syncUrl]);

  // ── Debounce and sync query → URL ─────────────────────────────────────────
  const setQuery = useCallback((value) => {
    const raw = typeof value === "string" ? value : "";
    setQueryState(raw);

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSearching(true);

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      const safe = sanitize ? prepareSafeSearchQuery(raw) : raw;
      setDebouncedQuery(safe);
      setIsSearching(false);

      // Save to history when query is non-empty
      if (safe.trim()) {
        const updated = writeHistory(historyKey, safe, historySize);
        if (updated) setHistory(updated);
      }

      // Sync to URL
      if (syncUrl) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            if (safe) {
              next.set(urlParam, safe);
            } else {
              next.delete(urlParam);
            }
            return next;
          },
          { replace: true }
        );
      }
    }, debounceMs);
  }, [sanitize, syncUrl, urlParam, debounceMs, historyKey, historySize, setSearchParams]);

  // ── clear ─────────────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQueryState("");
    setDebouncedQuery("");
    setIsSearching(false);

    if (syncUrl) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(urlParam);
          return next;
        },
        { replace: true }
      );
    }
  }, [syncUrl, urlParam, setSearchParams]);

  return {
    query,
    debouncedQuery,
    isSearching,
    history,
    setQuery,
    clear,
  };
};

export default useSearch;
