import { useCallback } from "react";
import { getDefaultFilters } from "../../utils/advancedFilterUtils";
import { prepareSafeSearchQuery } from "../../utils/inputSanitization";

/**
 * Filter mutation handlers for the events listing, extracted from EventsPage to
 * keep that component small. Each handler updates both the listing hook state
 * and the local (debounced) search input.
 */
const useEventFilterActions = (listing, setLocalSearchInput) => {
  const clearSearchAndFilters = useCallback(() => {
    listing.setSearchQuery("");
    listing.setFilterType("all");
    listing.setCategoryFilter("all");
    listing.setSortType("Newest");
    listing.setAdvancedFilters(getDefaultFilters());
    setLocalSearchInput("");
  }, [listing, setLocalSearchInput]);

  // Reset any active filters, then search for a popular tag suggested in the
  // empty-results state so the user gets unconstrained matches.
  const searchForTag = useCallback(
    (tag = "") => {
      const safeQuery = prepareSafeSearchQuery(tag);
      clearSearchAndFilters();
      setLocalSearchInput(safeQuery);
      listing.setSearchQuery(safeQuery);
      listing.setSafePage(1);
    },
    [listing, setLocalSearchInput, clearSearchAndFilters]
  );

  const applyFilterPreset = useCallback(
    (filters) => {
      const search = filters?.searchQuery || "";
      setLocalSearchInput(search);
      listing.setSearchQuery(search);
      listing.setFilterType(filters?.filterType || "all");
      listing.setCategoryFilter(filters?.categoryFilter || "all");
      listing.setSortType(filters?.sortType || "Newest");
      listing.setViewMode(filters?.viewMode || "grid");
      listing.setAdvancedFilters(filters?.advancedFilters || getDefaultFilters());
      listing.setSafePage(1);
    },
    [listing, setLocalSearchInput]
  );

  return { clearSearchAndFilters, searchForTag, applyFilterPreset };
};

export default useEventFilterActions;
