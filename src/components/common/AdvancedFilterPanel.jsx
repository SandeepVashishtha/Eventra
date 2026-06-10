import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, RotateCcw } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import ModeFilter from "./ModeFilter";
import StatusFilter from "./StatusFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import DateRangeFilter from "./DateRangeFilter";
import {
  EVENT_CATEGORIES,
  EVENT_MODES,
  EVENT_STATUS_OPTIONS,
  FILTER_PRESETS,
  hasActiveFilters,
  getDefaultFilters,
  normalizeAdvancedFilters,
} from "../../utils/advancedFilterUtils";

/**
 * AdvancedFilterPanel Component
 * Comprehensive filter panel with all available filters
 */
const AdvancedFilterPanel = ({
  filters = {},
  onFiltersChange,
  priceStats = { min: 0, max: 1500 },
  dateRange = {},
  isOpen = false,
  onToggleOpen,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    mode: true,
    status: true,
    location: false,
    price: false,
    date: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCategoryChange = (categories) => {
    onFiltersChange({ ...filters, categories });
  };

  const handleModeChange = (modes) => {
    onFiltersChange({ ...filters, modes });
  };

  const handleStatusChange = (statuses) => {
    onFiltersChange({ ...filters, statuses });
  };

  const handleLocationChange = (event) => {
    onFiltersChange({ ...filters, location: event.target.value });
  };

  const handlePriceChange = (priceRange) => {
    onFiltersChange({
      ...filters,
      priceRange:
        priceRange.min > 0 || priceRange.max < (priceStats.max || 1500)
          ? priceRange
          : null,
    });
  };

  const handleDateRangeChange = (dateRangeData) => {
    onFiltersChange({
      ...filters,
      dateRange:
        dateRangeData.startDate || dateRangeData.endDate ? dateRangeData : null,
    });
  };

  const handleClearAll = () => {
    onFiltersChange(getDefaultFilters());
  };

  const handlePresetApply = (presetFilters) => {
    onFiltersChange(
      normalizeAdvancedFilters({
        ...filters,
        ...presetFilters,
      }),
    );
  };

  const isSectionActive = (section) => {
    switch (section) {
      case "category":
        return Array.isArray(filters.categories) && filters.categories.length > 0;
      case "mode":
        return Array.isArray(filters.modes) && filters.modes.length > 0;
      case "status":
        return Array.isArray(filters.statuses) && filters.statuses.length > 0;
      case "location":
        return typeof filters.location === "string" && filters.location.trim() !== "";
      case "price":
        return filters.priceRange !== null;
      case "date":
        return filters.dateRange !== null;
      default:
        return false;
    }
  };

  const hasFilters = hasActiveFilters(filters);

  // Get the initial price range for slider
  const initPriceMin = filters.priceRange?.min ?? 0;
  const initPriceMax = filters.priceRange?.max ?? (priceStats.max || 1500);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <button
        onClick={onToggleOpen}
        className="w-full px-4 py-3 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
       aria-label="button">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Advanced Filters
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
              {
                Object.values(filters).filter(
                  (v) =>
                    (Array.isArray(v) && v.length > 0) ||
                    (v && typeof v === "object"),
                ).length
              }
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Clear all filters"
            >
              <RotateCcw size={16} />
            </button>
          )}
          <div className="text-gray-400 dark:text-gray-500">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetApply(preset.filters)}
                  className="px-3 py-1.5 text-xs font-medium rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("category")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Categories</span>
                {isSectionActive("category") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.category ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.category && (
              <div className="mt-3">
                <CategoryFilter
                  categories={EVENT_CATEGORIES}
                  selectedCategories={filters.categories || []}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            )}
          </div>

          {/* Mode Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("mode")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Event Mode</span>
                {isSectionActive("mode") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.mode ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.mode && (
              <div className="mt-3">
                <ModeFilter
                  modes={EVENT_MODES}
                  selectedModes={filters.modes || []}
                  onModeChange={handleModeChange}
                />
              </div>
            )}
          </div>

          {/* Status Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("status")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Event Status</span>
                {isSectionActive("status") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.status ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.status && (
              <div className="mt-3">
                <StatusFilter
                  statuses={EVENT_STATUS_OPTIONS}
                  selectedStatuses={filters.statuses || []}
                  onStatusChange={handleStatusChange}
                />
              </div>
            )}
          </div>

          {/* Location Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("location")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Location</span>
                {isSectionActive("location") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.location ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.location && (
              <div className="mt-3">
                <label htmlFor="event-location-filter" className="sr-only">
                  Filter by location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="event-location-filter"
                    type="text"
                    value={filters.location || ""}
                    onChange={handleLocationChange}
                    placeholder="City, venue, or region"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Price Range</span>
                {isSectionActive("price") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.price ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.price && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <PriceRangeSlider
                  minPrice={initPriceMin}
                  maxPrice={initPriceMax}
                  minLimit={priceStats.min || 0}
                  maxLimit={priceStats.max || 1500}
                  onRangeChange={handlePriceChange}
                />
              </div>
            )}
          </div>

          {/* Date Range Section */}
          <div>
            <button
              onClick={() => toggleSection("date")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Date Range</span>
                {isSectionActive("date") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  expandedSections.date ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.date && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <DateRangeFilter
                  onDateRangeChange={handleDateRangeChange}
                  minDate={dateRange.earliest}
                  maxDate={dateRange.latest}
                  startDate={filters.dateRange?.startDate}
                  endDate={filters.dateRange?.endDate}
                />
              </div>
            )}
          </div>

          {/* Clear All Button */}
          {hasFilters && (
            <button
              onClick={handleClearAll}
              className="w-full mt-4 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
             aria-label="button">
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
