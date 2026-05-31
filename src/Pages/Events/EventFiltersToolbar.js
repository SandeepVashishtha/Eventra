import { Grid, List, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import StyledDropdown from "../../components/StyledDropdown";
import AdvancedFilterPanel from "../../components/common/AdvancedFilterPanel";

const EVENT_FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "conference", label: "Conferences" },
  { key: "workshop", label: "Workshops" },
];

const FilterButton = ({ filter, filterType, onFilterChange }) => {
  const isActive = filterType === filter.key;
  return (
    <button
      type="button"
      onClick={() => onFilterChange(filter.key)}
      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full transition ${
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-700"
      }`}
      aria-pressed={isActive}
    >
      {filter.label}
    </button>
  );
};

const ViewModeButton = ({ mode, activeMode, onViewModeChange, icon: Icon }) => {
  const isActive = activeMode === mode;
  return (
    <button
      type="button"
      onClick={() => onViewModeChange(mode)}
      className={`p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
        isActive
          ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      aria-label={`${mode === "grid" ? "Grid" : "List"} view`}
      aria-pressed={isActive}
    >
      <Icon size={16} />
    </button>
  );
};

const EventFiltersToolbar = ({
  filterType,
  onFilterChange,
  sortType,
  onSortChange,
  viewMode,
  onViewModeChange,
  advancedFilters = {},
  onAdvancedFiltersChange,
  isAdvancedFiltersOpen,
  onToggleAdvancedFilters,
  priceStats,
  dateRangeStats,
  searchQuery,
  onSearchChange,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery || "");
  const debounceRef = useRef(null);

  useEffect(() => {
    setLocalQuery(searchQuery || "");

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleInput = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
  };

  const handleClear = () => {
    setLocalQuery("");

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    onSearchChange?.("");
  };

  return (
    <div className="mb-8 sm:mb-10 flex flex-col gap-4">
      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        priceStats={priceStats}
        dateRange={dateRangeStats}
        isOpen={isAdvancedFiltersOpen}
        onToggleOpen={onToggleAdvancedFilters}
      />

      {/* Basic Filters */}

      {/* Search Bar */}
      <div className="relative w-full">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={localQuery}
          onChange={handleInput}
          placeholder="Search events by title, category, date..."
          aria-label="Search events"
          className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
        />
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
        {EVENT_FILTERS.map((filter) => (
          <FilterButton
            key={filter.key}
            filter={filter}
            filterType={filterType}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>

      {/* Sort and View Controls */}
      {/* Sort + View Mode */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <label htmlFor="sort-events" className="sr-only">
            Sort events
          </label>
          <StyledDropdown
            label=""
            value={sortType === "" ? "" : sortType}
            onChange={onSortChange}
            options={["Newest", "Upcoming"]}
            placeholder="Sort by Date"
          />
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          <ViewModeButton
            mode="grid"
            activeMode={viewMode}
            onViewModeChange={onViewModeChange}
            icon={Grid}
          />
          <ViewModeButton
            mode="list"
            activeMode={viewMode}
            onViewModeChange={onViewModeChange}
            icon={List}
          />
        </div>
      </div>
    </div>
  );
};

export default EventFiltersToolbar;