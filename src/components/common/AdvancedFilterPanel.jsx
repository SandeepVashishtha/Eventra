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
  EVENT_SKILL_LEVELS,
  EVENT_TAGS,
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
    skillLevel: true,
    tags: false,
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

  const handleSkillLevelChange = (skillLevels) => {
    onFiltersChange({ ...filters, skillLevels });
  };

  const handleTagsChange = (tags) => {
    onFiltersChange({ ...filters, tags });
  };

  const handleLocationChange = (event) => {
    onFiltersChange({ ...filters, location: event.target.value });
  };

  const handlePriceChange = (priceRange) => {
    onFiltersChange({
      ...filters,
      priceRange:
        priceRange.min > 0 || priceRange.max < (priceStats.max || 1500) ? priceRange : null,
    });
  };

  const handleDateRangeChange = (dateRangeData) => {
    onFiltersChange({
      ...filters,
      dateRange: dateRangeData.startDate || dateRangeData.endDate ? dateRangeData : null,
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
      })
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
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <button
        onClick={onToggleOpen}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 sm:px-6 dark:hover:bg-gray-700"
        aria-label="button"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-100">
          Advanced Filters
          {hasFilters && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {
                Object.values(filters).filter(
                  (v) => (Array.isArray(v) && v.length > 0) || (v && typeof v === "object")
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
              className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
        <div className="space-y-4 border-t border-gray-200 px-4 py-4 sm:px-6 dark:border-gray-700">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetApply(preset.filters)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
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
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Categories</span>
                {isSectionActive("category") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.category ? "rotate-180" : ""}`}
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
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Event Mode</span>
                {isSectionActive("mode") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.mode ? "rotate-180" : ""}`}
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
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Event Status</span>
                {isSectionActive("status") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.status ? "rotate-180" : ""}`}
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

          {/* Skill Level Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("skillLevel")}
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span>Skill Level</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.skillLevel ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.skillLevel && (
              <div className="mt-3">
                <CategoryFilter
                  categories={EVENT_SKILL_LEVELS}
                  selectedCategories={filters.skillLevels || []}
                  onCategoryChange={handleSkillLevelChange}
                />
              </div>
            )}
          </div>

          {/* Tags Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("tags")}
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span>Tags</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.tags ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.tags && (
              <div className="mt-3">
                <CategoryFilter
                  categories={EVENT_TAGS.map((t) => ({ id: t, label: t }))}
                  selectedCategories={filters.tags || []}
                  onCategoryChange={handleTagsChange}
                />
              </div>
            )}
          </div>

          {/* Location Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("location")}
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Location</span>
                {isSectionActive("location") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.location ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.location && (
              <div className="mt-3">
                <label htmlFor="event-location-filter" className="sr-only">
                  Filter by location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="event-location-filter"
                    type="text"
                    value={filters.location || ""}
                    onChange={handleLocationChange}
                    placeholder="City, venue, or region"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-indigo-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Price Range</span>
                {isSectionActive("price") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.price && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
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
              className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <span className="flex items-center gap-2">
                <span>Date Range</span>
                {isSectionActive("date") && (
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"
                    aria-hidden="true"
                  />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${expandedSections.date ? "rotate-180" : ""}`}
              />
            </button>
            {expandedSections.date && (
              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
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
              className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              aria-label="button"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;
