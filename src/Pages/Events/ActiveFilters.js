import React from "react";
import { X } from "lucide-react";

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
}) => {
  const hasSearch = searchQuery && searchQuery.trim() !== "";
  const hasType = filterType && filterType !== "all";
  const hasSort = sortType && sortType !== "Newest";
  const hasView = viewMode && viewMode !== "grid";

  const anyActive = hasSearch || hasType || hasSort || hasView;

  const clearAll = () => {
    setSearchQuery && setSearchQuery("");
    setFilterType && setFilterType("all");
    setSortType && setSortType("Newest");
    setViewMode && setViewMode("grid");
  };

  if (!anyActive) return null;

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex flex-wrap gap-2 items-center">
        {hasSearch && (
          <Badge onClear={() => setSearchQuery("")}>Search: "{searchQuery}"</Badge>
        )}

        {hasType && (
          <Badge onClear={() => setFilterType("all")}>
            {FILTER_LABELS[filterType] || filterType}
          </Badge>
        )}

        {hasSort && (
          <Badge onClear={() => setSortType("Newest")}>Sort: {sortType}</Badge>
        )}

        {hasView && (
          <Badge onClear={() => setViewMode("grid")}>View: {viewMode}</Badge>
        )}
      </div>

      <div>
        <button
          onClick={clearAll}
          className="text-sm text-red-600 hover:underline"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default ActiveFilters;
