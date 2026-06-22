import { useCallback } from "react";
import { getDefaultFilters } from "../../utils/advancedFilterUtils";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";

const DEFAULT_FILTER_STATE = {
  searchQuery: "",
  filterType: "all",
  categoryFilter: "all",
  sortType: "Newest",
  viewMode: "grid",
};

/**
 * Merge a (possibly partial) preset with the default filter state, falling back
 * to defaults for any empty field. Kept as a pure helper so the hook itself
 * stays branch-free.
 */
const normalizePreset = (filters) => {
  const merged = {};
  for (const [key, fallback] of Object.entries(DEFAULT_FILTER_STATE)) {
    merged[key] = filters?.[key] || fallback;
  }
  merged.advancedFilters = filters?.advancedFilters || getDefaultFilters();
  return merged;
};

/**
 * Push a resolved filter state into the listing hook + local input. `viewMode`
 * is intentionally left untouched here so search/clear actions preserve the
 * user's current layout; only preset application overrides it (see below).
 */
const applyFilterState = (listing, setLocalSearchInput, state) => {
  setLocalSearchInput(state.searchQuery);
  listing.setSearchQuery(state.searchQuery);
  listing.setFilterType(state.filterType);
  listing.setCategoryFilter(state.categoryFilter);
  listing.setSortType(state.sortType);
  listing.setAdvancedFilters(state.advancedFilters);
};

/**
 * Filter mutation handlers for the events listing, extracted from EventsPage to
 * keep that component small. Each handler updates both the listing hook state
 * and the local (debounced) search input.
 */
const useEventFilterActions = (listing, setLocalSearchInput) => {
  const clearSearchAndFilters = useCallback(() => {
    applyFilterState(listing, setLocalSearchInput, normalizePreset(null));
  }, [listing, setLocalSearchInput]);

  // Reset any active filters, then search for a popular tag suggested in the
  // empty-results state so the user gets unconstrained matches.
  const searchForTag = useCallback(
    (tag = "") => {
      const safeQuery = prepareSafeSearchQuery(tag);
      applyFilterState(listing, setLocalSearchInput, {
        ...normalizePreset(null),
        searchQuery: safeQuery,
      });
      listing.setSafePage(1);
    },
    [listing, setLocalSearchInput]
  );

  const applyFilterPreset = useCallback(
    (filters) => {
      const preset = normalizePreset(filters);
      applyFilterState(listing, setLocalSearchInput, preset);
      listing.setViewMode(preset.viewMode);
      listing.setSafePage(1);
    },
    [listing, setLocalSearchInput]
  );

  return { clearSearchAndFilters, searchForTag, applyFilterPreset };
};

export default useEventFilterActions;
