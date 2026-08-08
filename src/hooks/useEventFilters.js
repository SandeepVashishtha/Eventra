/**
 * useEventFilters.js
 *
 * Centralised filter state management with URL sync and session persistence.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * `EventsPage.js` and `HackathonPage.js` each implement ~200 lines of
 * identical filter initialization logic:
 *
 *  1. Read URL params (useSearchParams)
 *  2. Fall back to sessionStorage if URL param absent
 *  3. Fall back to default value if storage empty
 *  4. Set each filter state individually
 *  5. Persist state back to URL on change
 *  6. Persist state back to sessionStorage on change
 *
 * This duplication means:
 *  - A bug fix needs to be applied in 2+ places
 *  - New filter params (e.g. "tags") need adding in 2+ places
 *  - URL sync logic drifts out of sync between pages over time
 *
 * FEATURES
 * --------
 *  1. URL sync          — reads from and writes to useSearchParams
 *  2. Session persist   — falls back to sessionStorage, updates on change
 *  3. Default values    — configurable per-page defaults
 *  4. Debounced search  — built-in debounce for search input
 *  5. Reset             — clears all filters back to defaults
 *  6. Hydrated flag     — prevents double-initialization race condition
 *
 * USAGE
 * -----
 *   const {
 *     filters,
 *     setFilter,
 *     resetFilters,
 *     isHydrated,
 *   } = useEventFilters({
 *     storageKey: "eventra:event-filters:v1",
 *     defaults: {
 *       search: "",
 *       filter: "all",
 *       category: "all",
 *       sort: "Newest",
 *       view: "grid",
 *       page: 1,
 *       perPage: 20,
 *     },
 *   });
 *
 *   // Read a filter value
 *   const { search, category, sort } = filters;
 *
 *   // Set a single filter (auto-syncs URL + storage)
 *   setFilter("category", "hackathon");
 *
 *   // Set multiple at once
 *   setFilter({ category: "hackathon", sort: "Oldest" });
 *
 *   // Reset all to defaults
 *   resetFilters();
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { safeJsonParse } from "utils/safeJsonParse";
import { useDebounce } from "hooks/useDebounce";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const readFromStorage = (key) => {
  try {
    return safeJsonParse(window.sessionStorage.getItem(key) || "{}", {});
  } catch {
    return {};
  }
};

const writeToStorage = (key, value) => {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors (private browsing, quota exceeded)
  }
};

/**
 * Safely parse a URL param value — returns the raw string or the default.
 */
const parseParam = (value, defaultValue) => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof defaultValue === "number") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return value;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useEventFilters
 *
 * @param {object} options
 * @param {string} options.storageKey     sessionStorage key for persistence
 * @param {object} options.defaults       Default values for all filter keys
 * @param {number} [options.debounceMs=300] Debounce for search input
 *
 * @returns {{
 *   filters:       object,
 *   setFilter:     (keyOrObj: string|object, value?: any) => void,
 *   resetFilters:  () => void,
 *   isHydrated:    boolean,
 *   debouncedSearch: string,
 * }}
 */
const useEventFilters = ({ storageKey, defaults = {}, debounceMs = 300 }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaults);
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydratedRef = useRef(false);

  // Debounced search value — consumers use this for API calls
  const debouncedSearch = useDebounce(filters.search ?? "", debounceMs);

  // ── Initialize from URL → storage → defaults (runs once) ──────────────────
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    const stored = readFromStorage(storageKey);

    const hydrated = {};
    for (const [key, defaultValue] of Object.entries(defaults)) {
      const fromUrl = searchParams.get(key);
      const fromStorage = stored[key];
      hydrated[key] = parseParam(
        fromUrl ?? (fromStorage !== undefined ? String(fromStorage) : null),
        defaultValue
      );
    }

    setFilters(hydrated);
    setIsHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — runs once on mount only

  // ── Sync filters → URL params ──────────────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      const defaultValue = defaults[key];
      // Only write to URL if different from default (keeps URLs clean)
      if (value !== defaultValue && value !== "" && value !== null) {
        params.set(key, String(value));
      }
    }

    setSearchParams(params, { replace: true });
    writeToStorage(storageKey, filters);
  }, [filters, isHydrated, storageKey, defaults, setSearchParams]);

  // ── setFilter ──────────────────────────────────────────────────────────────
  /**
   * Set one or more filter values.
   *
   * @param {string|object} keyOrObj  Key string or { key: value } object
   * @param {*}             [value]   Value when keyOrObj is a string
   */
  const setFilter = useCallback((keyOrObj, value) => {
    if (typeof keyOrObj === "object" && keyOrObj !== null) {
      setFilters((prev) => ({ ...prev, ...keyOrObj }));
    } else {
      setFilters((prev) => ({ ...prev, [keyOrObj]: value }));
    }
  }, []);

  // ── resetFilters ───────────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setFilters(defaults);
    writeToStorage(storageKey, defaults);
    setSearchParams({}, { replace: true });
  }, [defaults, storageKey, setSearchParams]);

  return {
    filters,
    setFilter,
    resetFilters,
    isHydrated,
    debouncedSearch,
  };
};

export default useEventFilters;
