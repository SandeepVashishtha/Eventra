import React, { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, RotateCcw } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import ModeFilter from "./ModeFilter";
import StatusFilter from "./StatusFilter";
import PriceRangeSlider from "./PriceRangeSlider";
import DateRangeFilter from "./DateRangeFilter";
import { SlidersHorizontal } from "lucide-react";
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

interface PriceRange {
  min: number;
  max: number;
}

interface DateRange {
  startDate?: string | null;
  endDate?: string | null;
  earliest?: string;
  latest?: string;
}

interface Filters {
  categories?: string[];
  modes?: string[];
  statuses?: string[];
  skillLevels?: string[];
  tags?: string[];
  location?: string;
  priceRange?: PriceRange | null;
  dateRange?: DateRange | null;
}

interface PriceStats {
  min?: number;
  max?: number;
}

interface AdvancedFilterPanelProps {
  filters?: Filters;
  onFiltersChange: (filters: Filters) => void;
  priceStats?: PriceStats;
  dateRange?: DateRange;
  isOpen?: boolean;
  onToggleOpen?: () => void;
}

/**
 * AdvancedFilterPanel Component
 * Comprehensive filter panel with all available filters
 */
const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof expandedSections],
    }));
  };

  const handleCategoryChange = (categories: string[]) => {
    onFiltersChange({ ...filters, categories });
  };

  const handleModeChange = (modes: string[]) => {
    onFiltersChange({ ...filters, modes });
  };

  const handleStatusChange = (statuses: string[]) => {
    onFiltersChange({ ...filters, statuses });
  };

  const handleSkillLevelChange = (skillLevels: string[]) => {
    onFiltersChange({ ...filters, skillLevels });
  };

  const handleTagsChange = (tags: string[]) => {
    onFiltersChange({ ...filters, tags });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, location: event.target.value });
  };

  const handlePriceChange = (priceRange: PriceRange) => {
    onFiltersChange({
      ...filters,
      priceRange:
        priceRange.min > 0 || priceRange.max < (priceStats.max || 1500)
          ? priceRange
          : null,
    });
  };

  const handleDateRangeChange = (dateRangeData: DateRange) => {
    onFiltersChange({
      ...filters,
      dateRange:
        dateRangeData.startDate || dateRangeData.endDate ? dateRangeData : null,
    });
  };

  const handleClearAll = () => {
    onFiltersChange(getDefaultFilters());
  };

  const handlePresetApply = (presetFilters: Partial<Filters>) => {
    onFiltersChange(
      normalizeAdvancedFilters({
        ...filters,
        ...presetFilters,
      }),
    );
  };

  const isSectionActive = (section: string) => {
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
    <div className="
   w-full
bg-white dark:bg-gray-800
rounded-3xl
border border-gray-200 dark:border-gray-700
shadow-xl
backdrop-blur-sm
overflow-hidden
  ">
      {/* Header */}
      <button
        onClick={onToggleOpen}
        className="
        w-full
        px-8 py-6
        flex items-center justify-between
        bg-linear-to-r
        from-indigo-50
        to-white
        dark:from-gray-800
        dark:to-gray-800
        hover:from-indigo-100
        transition-all duration-300
        "       aria-label="button">
        <h2 className="
text-2xl md:text-3xl
font-bold
tracking-tight
text-gray-900 dark:text-white
flex items-center gap-3
">
        <SlidersHorizontal className="w-6 h-6 text-indigo-600" />
          Advanced Filters
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-indigo-600 rounded-full">
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
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 space-y-8">
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
                  className="
                  px-4 py-2
                  text-sm font-medium
                  rounded-full
                  border border-indigo-200
                  dark:border-indigo-700
                  bg-indigo-50
                  dark:bg-indigo-900/20
                  text-indigo-700
                  dark:text-indigo-300
                  hover:scale-105
                  hover:shadow-md
                  transition-all duration-200
                  "                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Section */}
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>            <button
              onClick={() => toggleSection("category")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
              <span className="flex items-center gap-2">
                <span>Categories</span>
                {isSectionActive("category") && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" aria-hidden="true" />
                )}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
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
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>            <button
              onClick={() => toggleSection("mode")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
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
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>
            <button
              onClick={() => toggleSection("status")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
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

          {/* Skill Level Filter Section */}
          <div>
            <button
              onClick={() => toggleSection("skillLevel")}
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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
              className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
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
                  categories={EVENT_TAGS.map(t => ({ id: t, label: t }))}
                  selectedCategories={filters.tags || []}
                  onCategoryChange={handleTagsChange}
                />
              </div>
            )}
          </div>

          {/* Location Filter Section */}
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>
            <button
              onClick={() => toggleSection("location")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
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
                    className="
                    w-full
                    pl-10 pr-4 py-3
                    rounded-xl
                    border border-gray-300
                    dark:border-gray-600
                    bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white
                    shadow-sm
                    focus:ring-2
                    focus:ring-indigo-500
                    focus:border-indigo-500
                    transition-all
                    "                  />
                </div>
              </div>
            )}
          </div>

          {/* Price Range Section */}
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>
            <button
              onClick={() => toggleSection("price")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
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
              <div className="
              mt-4
              p-4
              rounded-xl
              bg-white
              dark:bg-gray-700/40
              border border-gray-200
              dark:border-gray-600
              ">
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
          <div
className="
p-5
rounded-2xl
bg-gray-50
dark:bg-gray-700/20
border border-gray-200
dark:border-gray-700
shadow-sm
hover:shadow-md
transition-all duration-300
"
>
            <button
              onClick={() => toggleSection("date")}
              className="
              w-full
              flex items-center justify-between
              py-1
              text-lg
              font-bold
              tracking-wide
              text-gray-800 dark:text-gray-200
              hover:text-indigo-600
              dark:hover:text-indigo-400
              transition-colors
              "            >
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
              className="
              w-full
              mt-6
              px-5 py-3
              font-semibold
              rounded-xl
              border border-red-200
              dark:border-red-800
              bg-red-50
              dark:bg-red-900/20
              text-red-600
              dark:text-red-400
              hover:bg-red-100
              dark:hover:bg-red-900/40
              hover:shadow-md
              transition-all duration-300
              "
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
