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
  const [ticketType, setTicketType] = useState("All");
  const [sortBy, setSortBy] = useState("Event Date (Newest)");

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
        const matchType =
          selectedTypes.includes("All") || selectedTypes.includes(item.type);

        // Status match (check both status and projectStatus)
        const matchStatus =
          selectedStatuses.includes("All") ||
          selectedStatuses.includes(item.status) ||
          selectedStatuses.includes(item.projectStatus);

        // Ticket type match
        const matchTicket = 
          ticketType === "All" || item.ticketType === ticketType || (ticketType === "General" && !item.ticketType);

        return matchSearch && matchType && matchStatus && matchTicket;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date || a.purchaseDate || 0).getTime();
        const dateB = new Date(b.date || b.purchaseDate || 0).getTime();
        const purchaseA = new Date(a.purchaseDate || a.date || 0).getTime();
        const purchaseB = new Date(b.purchaseDate || b.date || 0).getTime();
        
        switch (sortBy) {
          case "Event Date (Newest)": return dateB - dateA;
          case "Event Date (Oldest)": return dateA - dateB;
          case "Purchase Date (Newest)": return purchaseB - purchaseA;
          case "Purchase Date (Oldest)": return purchaseA - purchaseB;
          default: return dateB - dateA;
        }
      });
  }, [data, debouncedTerm, selectedTypes, selectedStatuses, ticketType, sortBy]);

  // --- Reset everything ---
  const clearAll = useCallback(() => {
    clearSearch();
    setSelectedTypes(["All"]);
    setSelectedStatuses(["All"]);
    setTicketType("All");
    setSortBy("Event Date (Newest)");
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

    // Tickets filters
    ticketType,
    setTicketType,
    sortBy,
    setSortBy,

    // Helpers
    clearAll,
    clearSearch,
  };
}

export default useDashboardFilters;
