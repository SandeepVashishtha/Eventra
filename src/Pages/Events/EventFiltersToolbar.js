import { Grid, List, Search, X, RotateCcw, Sparkles, Filter, ChevronDown, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import StyledDropdown from "../../components/StyledDropdown";
import AdvancedFilterPanel from "../../components/common/AdvancedFilterPanel";

const CATEGORY_OPTIONS = [
  { id: "all", label: "All Categories" },
  { id: "hackathons", label: "Hackathons" },
  { id: "tech talks", label: "Tech Talks" },
  { id: "web-development", label: "Web Development" },
  { id: "ai-ml", label: "AI & Machine Learning" },
  { id: "devops-cloud", label: "DevOps & Cloud" },
  { id: "web3-blockchain", label: "Web3 & Blockchain" },
  { id: "mobile", label: "Mobile Dev" },
  { id: "design-ux", label: "Design & UX" },
  { id: "cultural", label: "Cultural & Networking" },
];

const EventFiltersToolbar = ({
  filterType,
  onFilterChange,
  categoryFilter = "all",
  onCategoryChange,
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
  onResetFilters,
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

  const hasAnyFilterActive =
    (searchQuery && searchQuery.trim() !== "") ||
    (filterType && filterType !== "all") ||
    (categoryFilter && categoryFilter !== "all") ||
    (advancedFilters &&
      ((advancedFilters.categories && advancedFilters.categories.length > 0) ||
        (advancedFilters.modes && advancedFilters.modes.length > 0) ||
        (advancedFilters.statuses && advancedFilters.statuses.length > 0) ||
        (advancedFilters.location && advancedFilters.location.trim() !== "") ||
        (advancedFilters.priceRange && (advancedFilters.priceRange.min > 0 || advancedFilters.priceRange.max < Infinity))));

  return (
    <div className="w-full flex flex-col gap-6 bg-slate-950/40 p-4 sm:p-6 rounded-3xl border border-slate-900 shadow-xl backdrop-blur-sm">
      
      {/* 1. Header & Controls Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-5">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Filter size={18} className="text-indigo-400" />
            Discover & Refine
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Refine listed events dynamically based on search, domain category, or schedules.
          </p>
        </div>

        {/* Action controls (Reset + Advanced filter toggle) */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          {/* Advanced Filter Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl border cursor-pointer transition duration-300 ${
              isAdvancedFiltersOpen
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Sparkles size={14} className={isAdvancedFiltersOpen ? "animate-pulse" : ""} />
            Advanced Options
          </button>

          {/* Reset Filters Action Button */}
          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 transition duration-300 shadow-md cursor-pointer ml-auto md:ml-0"
              title="Reset all filters back to defaults"
            >
              <RotateCcw size={13} className="shrink-0" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Panel dropdown container */}
      <AdvancedFilterPanel
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        priceStats={priceStats}
        dateRange={dateRangeStats}
        isOpen={isAdvancedFiltersOpen}
        onToggleOpen={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
      />

      {/* 2. Interactive Search & Timing row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Real-time Search Box */}
        <div className="relative flex-1 group">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors pointer-events-none"
          />
          <input
            type="text"
            value={localQuery}
            onChange={handleInput}
            placeholder="Search events by title, description..."
            aria-label="Search events"
            className="w-full pl-10 pr-10 py-3 text-sm rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 shadow-inner"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status timing pills switcher */}
        <div className="flex flex-wrap gap-2 items-center shrink-0">
          {[
            { key: "all", label: "All Events" },
            { key: "live", label: "Live Now", pulse: true },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past Events" },
          ].map((tab) => {
            const isActive = filterType === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 border cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]"
                    : "bg-slate-900/40 hover:bg-slate-850/60 text-slate-400 hover:text-slate-200 border-slate-800/80 hover:border-slate-700/80"
                }`}
              >
                {tab.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category Selector Section */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Domain Category
        </span>
        
        {/* Desktop Scrolling Category Tabs */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border whitespace-nowrap transition duration-300 cursor-pointer ${
                  isActive
                    ? "bg-slate-100 text-slate-950 border-slate-200 shadow-sm font-bold scale-[1.02]"
                    : "bg-slate-900/50 hover:bg-slate-850/80 text-slate-400 hover:text-slate-200 border-slate-800/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown Category Select */}
        <div className="block md:hidden relative w-full">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-slate-950 text-slate-100">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Sort and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-900 pt-5">
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

        {/* Grid / List switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 shadow-inner shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-2.5 rounded-lg transition-all duration-250 flex items-center justify-center cursor-pointer ${
              viewMode === "grid"
                ? "bg-slate-100 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <Grid size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-2.5 rounded-lg transition-all duration-250 flex items-center justify-center cursor-pointer ${
              viewMode === "list"
                ? "bg-slate-100 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:bg-slate-850 hover:text-slate-200"
            }`}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default EventFiltersToolbar;
