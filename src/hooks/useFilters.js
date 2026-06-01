import { useSearchParams } from "react-router-dom";

const parseArrayParam = (value) => {
  if (!value) return [];
  return value.split(",").filter(Boolean);
};

/**
 * @fileoverview useFilters - URL-synced filter state management hook
 * @module hooks/useFilters
 *
 * Provides a reusable hook for managing filter state synchronized with
 * browser URL search parameters. Enables sharable and reload-persistent
 * filter states across sessions.
 *
 * @returns {Object} Hook state and actions:
 *   - filters {Object} Current filter state including:
 *       - search {string} Search query string.
 *       - category {string[]} Selected categories.
 *       - mode {string[]} Selected modes.
 *       - status {string[]} Selected statuses.
 *       - sort {string} Sorting option (default: "Newest").
 *       - view {string} View mode (default: "grid").
 *   - updateFilters {Function} Apply updates to filters and sync with URL.
 *   - clearFilters {Function} Reset all filters to defaults and clear URL params.
 *
 * @example
 * const { filters, updateFilters, clearFilters } = useFilters();
 *
 * // Update filters
 * updateFilters({ category: ["books", "electronics"], sort: "Popular" });
 *
 * // Clear all filters
 * clearFilters();
 *
 * @notes
 * - Filter changes update the browser URL via search params.
 * - Useful for maintaining state across reloads and sharable URLs.
 */

export default function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get("search") || "",
    category: parseArrayParam(searchParams.get("category")),
    mode: parseArrayParam(searchParams.get("mode")),
    status: parseArrayParam(searchParams.get("status")),
    sort: searchParams.get("sort") || "Newest",
    view: searchParams.get("view") || "grid",
  };

  const updateFilters = (updates) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else {
        params.set(
          key,
          Array.isArray(value)
            ? value.join(",")
            : value,
        );
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return {
    filters,
    updateFilters,
    clearFilters,
  };
}