import { useState, useMemo, useCallback } from "react";
import { useDebouncedSearch } from "./useDebouncedSearch";

/**
 * Custom hook for debounced searching and multi-select filtering of dashboard items.
 *
 * @param {Array} data - The full, unfiltered dataset (e.g. MOCK_DATA).
 * @param {Object} options
 * @param {number} [options.debounceMs=300] - Debounce delay for the search input.
 * @returns {Object} Filter state, setters, and the filtered + sorted result set.
 */
export function useDashboardFilters(data = [], { debounceMs = 300 } = {}) {
  // --- Debounced search ---
  const {
    searchTerm,
    debouncedTerm,
    setSearchTerm,
    isDebouncing,
    clear: clearSearch,
  } = useDebouncedSearch("", debounceMs);

  // --- Multi-select filter state ---
  const [selectedTypes, setSelectedTypes] = useState(["All"]);
  const [selectedStatuses, setSelectedStatuses] = useState(["All"]);

  // Toggle a value inside a multi-select array.
  // Selecting "All" resets the array; deselecting the last item falls back to "All".
  const toggleFilter = useCallback((current, setCurrent, value) => {
    if (value === "All") {
      setCurrent(["All"]);
      return;
    }

    let next = current.filter((v) => v !== "All");

    if (next.includes(value)) {
      next = next.filter((v) => v !== value);
    } else {
      next = [...next, value];
    }

    setCurrent(next.length === 0 ? ["All"] : next);
  }, []);

  const toggleType = useCallback(
    (value) => toggleFilter(selectedTypes, setSelectedTypes, value),
    [selectedTypes, toggleFilter]
  );

  const toggleStatus = useCallback(
    (value) => toggleFilter(selectedStatuses, setSelectedStatuses, value),
    [selectedStatuses, toggleFilter]
  );

  // --- Derived filtered + sorted data ---
  const filteredData = useMemo(() => {
    const query = debouncedTerm.toLowerCase();

    return data
      .filter((item) => {
        // Search match
        const matchSearch = item.title.toLowerCase().includes(query);

        // Type match
        const matchType = selectedTypes.includes("All") || selectedTypes.includes(item.type);

        // Status match (check both status and projectStatus)
        const matchStatus =
          selectedStatuses.includes("All") ||
          selectedStatuses.includes(item.status) ||
          selectedStatuses.includes(item.projectStatus);

        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      });
  }, [data, debouncedTerm, selectedTypes, selectedStatuses]);

  // --- Reset everything ---
  const clearAll = useCallback(() => {
    clearSearch();
    setSelectedTypes(["All"]);
    setSelectedStatuses(["All"]);
  }, [clearSearch]);

  // Active filter count (for UI badges)
  const activeFilterCount =
    (selectedTypes.includes("All") ? 0 : selectedTypes.length) +
    (selectedStatuses.includes("All") ? 0 : selectedStatuses.length);

  return {
    // Search
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    isDebouncing,

    // Multi-select filters
    selectedTypes,
    setSelectedTypes,
    toggleType,
    selectedStatuses,
    setSelectedStatuses,
    toggleStatus,

    // Results
    filteredData,
    activeFilterCount,

    // Helpers
    clearAll,
    clearSearch,
  };
}

export default useDashboardFilters;
