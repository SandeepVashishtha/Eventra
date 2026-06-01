import FilterBadge from "../../components/common/FilterBadge";
import {
  getCategoryLabel,
  getDefaultFilters,
  hasActiveFilters,
} from "../../utils/advancedFilterUtils";

const FILTER_LABELS = {
  all: "All",
  upcoming: "Upcoming",
  past: "Past",
  conference: "Conferences",
  workshop: "Workshops",
};


const ActiveFilters = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  sortType,
  setSortType,
  viewMode,
  setViewMode,
  advancedFilters = {},
  onAdvancedFiltersChange,
}) => {
  const hasSearch = searchQuery && searchQuery.trim() !== "";
  const hasType = filterType && filterType !== "all";
  const hasSort = sortType && sortType !== "Newest";
  const hasView = viewMode && viewMode !== "grid";
  const hasAdvancedFilters = hasActiveFilters(advancedFilters);

  const anyActive =
    hasSearch || hasType || hasSort || hasView || hasAdvancedFilters;

  const clearAll = () => {
    if (typeof setSearchQuery === "function") setSearchQuery("");
    if (typeof setFilterType === "function") setFilterType("all");
    if (typeof setSortType === "function") setSortType("Newest");
    if (typeof setViewMode === "function") setViewMode("grid");
    if (typeof onAdvancedFiltersChange === "function") onAdvancedFiltersChange(getDefaultFilters());
  };

  const removeCategory = (category) => {
    const updatedCategories = advancedFilters.categories.filter(
      (c) => c !== category,
    );
    onAdvancedFiltersChange({
      ...advancedFilters,
      categories: updatedCategories,
    });
  };

  const removeMode = (mode) => {
    const updatedModes = advancedFilters.modes.filter((m) => m !== mode);
    onAdvancedFiltersChange({
      ...advancedFilters,
      modes: updatedModes,
    });
  };

  const removeStatus = (status) => {
    const updatedStatuses = advancedFilters.statuses.filter(
      (s) => s !== status,
    );
    onAdvancedFiltersChange({
      ...advancedFilters,
      statuses: updatedStatuses,
    });
  };

  const clearPriceRange = () => {
    onAdvancedFiltersChange({
      ...advancedFilters,
      priceRange: null,
    });
  };

  const clearDateRange = () => {
    onAdvancedFiltersChange({
      ...advancedFilters,
      dateRange: null,
    });
  };

  const clearLocation = () => {
    onAdvancedFiltersChange({
      ...advancedFilters,
      location: "",
    });
  };

  if (!anyActive) return null;

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 items-start">
        {hasSearch && (
          <FilterBadge
            label={`Search: "${searchQuery}"`}
            onRemove={() => setSearchQuery("")}
            variant="primary"
          />
        )}

        {hasType && (
          <FilterBadge
            label={`Type: ${FILTER_LABELS[filterType] || filterType}`}
            onRemove={() => setFilterType("all")}
            variant="primary"
          />
        )}

        {hasSort && (
          <FilterBadge
            label={`Sort: ${sortType}`}
            onRemove={() => setSortType("Newest")}
            variant="primary"
          />
        )}

        {hasView && (
          <FilterBadge
            label={`View: ${viewMode}`}
            onRemove={() => setViewMode("grid")}
            variant="primary"
          />
        )}

        {advancedFilters.categories &&
          advancedFilters.categories.map((category) => (
            <FilterBadge
              key={`cat-${category}`}
              label={getCategoryLabel(category)}
              onRemove={() => removeCategory(category)}
              variant="success"
            />
          ))}

        {advancedFilters.modes &&
          advancedFilters.modes.map((mode) => (
            <FilterBadge
              key={`mode-${mode}`}
              label={`Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
              onRemove={() => removeMode(mode)}
              variant="success"
            />
          ))}

        {advancedFilters.statuses &&
          advancedFilters.statuses.map((status) => (
            <FilterBadge
              key={`status-${status}`}
              label={`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
              onRemove={() => removeStatus(status)}
              variant="warning"
            />
          ))}

        {advancedFilters.location && (
          <FilterBadge
            label={`Location: ${advancedFilters.location}`}
            onRemove={clearLocation}
            variant="success"
          />
        )}

        {advancedFilters.priceRange && (
          <FilterBadge
            label={`Price: $${advancedFilters.priceRange.min} - $${advancedFilters.priceRange.max}`}
            onRemove={clearPriceRange}
            variant="warning"
          />
        )}

        {advancedFilters.dateRange &&
          (advancedFilters.dateRange.startDate ||
            advancedFilters.dateRange.endDate) && (
            <FilterBadge
              label={`Date: ${
                advancedFilters.dateRange.startDate
                  ? new Date(
                      advancedFilters.dateRange.startDate,
                    ).toLocaleDateString()
                  : "Start"
              } - ${
                advancedFilters.dateRange.endDate
                  ? new Date(
                      advancedFilters.dateRange.endDate,
                    ).toLocaleDateString()
                  : "End"
              }`}
              onRemove={clearDateRange}
              variant="warning"
            />
          )}
      </div>

      <div>
        <button
          onClick={clearAll}
          className="text-sm text-red-600 hover:underline dark:text-red-400"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;
