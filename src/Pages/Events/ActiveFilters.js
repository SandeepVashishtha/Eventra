import React from "react";
import { X } from "lucide-react";
import FilterBadge from "../../components/common/FilterBadge";
import { getCategoryLabel } from "../../utils/advancedFilterUtils";

const FILTER_LABELS = {
  all: "All",
  upcoming: "Upcoming",
  past: "Past",
  conference: "Conferences",
  workshop: "Workshops",
};

const Badge = ({ children, onClear }) => (
  <span className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-full text-sm shadow-sm border border-gray-200 dark:border-gray-700">
    <span className="truncate max-w-[12rem]">{children}</span>
    <button
      onClick={onClear}
      aria-label="Remove filter"
      className="opacity-70 hover:opacity-100 ml-1 -mr-1 p-1 rounded-full transition"
    >
      <X size={14} />
    </button>
  </span>
);

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
  const hasAdvancedFilters =
    (advancedFilters.categories && advancedFilters.categories.length > 0) ||
    (advancedFilters.modes && advancedFilters.modes.length > 0) ||
    (advancedFilters.statuses && advancedFilters.statuses.length > 0) ||
    (advancedFilters.priceRange &&
      (advancedFilters.priceRange.min > 0 ||
        advancedFilters.priceRange.max < Infinity)) ||
    (advancedFilters.dateRange &&
      (advancedFilters.dateRange.startDate ||
        advancedFilters.dateRange.endDate));

  const anyActive =
    hasSearch || hasType || hasSort || hasView || hasAdvancedFilters;

  const clearAll = () => {
    setSearchQuery && setSearchQuery("");
    setFilterType && setFilterType("all");
    setSortType && setSortType("Newest");
    setViewMode && setViewMode("grid");
    onAdvancedFiltersChange && onAdvancedFiltersChange({});
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
