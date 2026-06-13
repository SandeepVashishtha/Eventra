/**
 * useAdvancedEventSearch
 *
 * A powerful, composable hook for client-side event searching and filtering.
 *
 * Features:
 * - Fuzzy full-text search across title, description, tags, and location
 * - Date-range filter (from / to)
 * - Category / type multi-select filter
 * - Status filter (upcoming | live | past)
 * - Sort by: relevance | date-asc | date-desc | attendees-desc
 * - Saved search presets with localStorage persistence
 * - Debounced query input to avoid excessive re-renders
 *
 * Usage:
 *   const { results, query, setQuery, filters, setFilters, presets, savePreset } =
 *     useAdvancedEventSearch(events);
 */

import { useState, useMemo, useCallback } from "react";
import { safeLocalStorage } from "../utils/safeStorage";
import { useDebounce } from "./useDebounce";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRESETS_KEY = "eventra_search_presets";
const MAX_PRESETS = 5;

export const SORT_OPTIONS = {
  RELEVANCE: "relevance",
  DATE_ASC: "date-asc",
  DATE_DESC: "date-desc",
  ATTENDEES_DESC: "attendees-desc",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Naïve fuzzy match: returns true if every word of the query appears
 * somewhere in the target string (case-insensitive).
 */
function fuzzyMatch(query, target) {
  if (!query) return true;
  const words = query.toLowerCase().trim().split(/\s+/);
  const lTarget = target.toLowerCase();
  return words.every((w) => lTarget.includes(w));
}

/**
 * Builds a searchable blob from an event object.
 */
function eventSearchBlob(event) {
  return [
    event.title,
    event.description,
    event.type,
    event.category,
    event.location,
    Array.isArray(event.tags) ? event.tags.join(" ") : "",
    event.organizer?.name || "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Compares two events for a given sort mode.
 */
function compareEvents(a, b, sort) {
  switch (sort) {
    case SORT_OPTIONS.DATE_ASC:
      return new Date(a.date || a.startDate) - new Date(b.date || b.startDate);
    case SORT_OPTIONS.DATE_DESC:
      return new Date(b.date || b.startDate) - new Date(a.date || a.startDate);
    case SORT_OPTIONS.ATTENDEES_DESC:
      return (b.attendees ?? 0) - (a.attendees ?? 0);
    default: // relevance — preserve natural order
      return 0;
  }
}

/**
 * Load persisted presets from localStorage.
 */
function loadPresets() {
  try {
    const raw = safeLocalStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Persist presets to localStorage.
 */
function savePresetsToStorage(presets) {
  try {
    safeLocalStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // ignore quota errors
  }
}

// ---------------------------------------------------------------------------
// Default filter state
// ---------------------------------------------------------------------------

export const DEFAULT_FILTERS = {
  categories: [],   // string[]
  statuses: [],     // ("upcoming" | "live" | "past")[]
  dateFrom: "",     // "YYYY-MM-DD"
  dateTo: "",       // "YYYY-MM-DD"
  sort: SORT_OPTIONS.RELEVANCE,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * @param {Array}  events      - Full list of event objects
 * @param {Object} [options]
 * @param {number} [options.debounceMs=250]  - Query debounce delay in ms
 */
export default function useAdvancedEventSearch(events = [], { debounceMs = 250 } = {}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [presets, setPresets] = useState(loadPresets);

  const debouncedQuery = useDebounce(query, debounceMs);

  // ---- Filter + sort pipeline ----
  const results = useMemo(() => {
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to   = filters.dateTo   ? new Date(filters.dateTo)   : null;

    return events
      .filter((event) => {
        // Full-text fuzzy search
        if (debouncedQuery && !fuzzyMatch(debouncedQuery, eventSearchBlob(event))) {
          return false;
        }

        // Category filter
        if (
          filters.categories.length > 0 &&
          !filters.categories.includes(event.category) &&
          !filters.categories.includes(event.type)
        ) {
          return false;
        }

        // Status filter
        if (
          filters.statuses.length > 0 &&
          !filters.statuses.includes(event.status)
        ) {
          return false;
        }

        // Date range filter
        const eventDate = new Date(event.date || event.startDate);
        if (from && eventDate < from) return false;
        if (to   && eventDate > to)   return false;

        return true;
      })
      .sort((a, b) => compareEvents(a, b, filters.sort));
  }, [events, debouncedQuery, filters]);

  // ---- Preset management ----

  /**
   * Save current query + filters as a named preset.
   * @param {string} name  - User-facing preset name
   */
  const savePreset = useCallback(
    (name) => {
      if (!name?.trim()) return;
      const preset = {
        id: Date.now(),
        name: name.trim(),
        query,
        filters,
        savedAt: new Date().toISOString(),
      };
      setPresets((prev) => {
        const next = [preset, ...prev].slice(0, MAX_PRESETS);
        savePresetsToStorage(next);
        return next;
      });
    },
    [query, filters]
  );

  /**
   * Load a preset (restore query + filters from it).
   * @param {Object} preset
   */
  const loadPreset = useCallback((preset) => {
    setQuery(preset.query ?? "");
    setFilters(preset.filters ?? DEFAULT_FILTERS);
  }, []);

  /**
   * Delete a preset by id.
   * @param {number} id
   */
  const deletePreset = useCallback((id) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      savePresetsToStorage(next);
      return next;
    });
  }, []);

  /**
   * Reset query and filters to their defaults.
   */
  const reset = useCallback(() => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Update a single filter key.
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Toggle a value in a multi-select filter array.
   * @param {"categories"|"statuses"} key
   * @param {string} value
   */
  const toggleFilterItem = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }, []);

  const hasActiveFilters =
    Boolean(debouncedQuery) ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return {
    // State
    query,
    setQuery,
    filters,
    setFilters,
    updateFilter,
    toggleFilterItem,
    reset,
    hasActiveFilters,

    // Results
    results,
    resultCount: results.length,

    // Presets
    presets,
    savePreset,
    loadPreset,
    deletePreset,
  };
}
