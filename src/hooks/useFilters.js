/**
 * @fileoverview useFilters - URL-synced event filter state hook
 * @module hooks/useFilters
 */
import { useSearchParams } from "react-router-dom";

const parseArrayParam = (value) => {
  if (!value) return [];
  return value.split(",").filter(Boolean);
};

/**
 * A custom React hook that manages event filter state synchronized
 * with URL search parameters.
 *
 * Filters are read from and written to the URL so they persist across
 * page refreshes and can be shared via URL. Supports search, category,
 * mode, status, sort, and view filters.
 *
 * @returns {{
 *   filters: {
 *     search: string,
 *     category: string[],
 *     mode: string[],
 *     status: string[],
 *     sort: string,
 *     view: string
 *   },
 *   updateFilters: Function,
 *   clearFilters: Function
 * }}
 *
 * @example
 * const { filters, updateFilters, clearFilters } = useFilters();
 * updateFilters({ search: 'hackathon', mode: ['online'] });
 * clearFilters(); // resets all filters and clears URL params
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