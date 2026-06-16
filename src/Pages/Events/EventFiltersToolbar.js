import { Grid, List, Calendar, Search, X, RotateCcw, Sparkles, Filter, Save, Pencil, Trash2, Upload, RefreshCcw, Download } from "lucide-react";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import StyledDropdown from "../../components/StyledDropdown";
import AdvancedFilterPanel from "../../components/common/AdvancedFilterPanel";
import useEventFilterPresets from "../../hooks/useEventFilterPresets";
import useFilterSuggestions from "../../hooks/useFilterSuggestions";
import { exportEventsResultFile } from "../../utils/eventResultsExport";

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
  currentFilterConfig,
  onApplyPreset,
  visibleEvents = [],
  // totalElements = 0,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery || "");
  const [presetName, setPresetName] = useState("");
  const [editingPresetId, setEditingPresetId] = useState("");
  const [editingPresetName, setEditingPresetName] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [exportError, setExportError] = useState("");
  const debounceRef = useRef(null);
  
  const {
    presets,
    presetError,
    clearPresetError,
    savePreset,
    renamePreset,
    updatePreset,
    deletePreset,
  } = useEventFilterPresets();
  
  const { suggestions } = useFilterSuggestions({
    currentFilters: currentFilterConfig,
    visibleEvents,
    presets,
  });

  useEffect(() => {
    setLocalQuery(searchQuery || "");
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleInput = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange?.(value), 300);
  };

  const handleClear = () => {
    setLocalQuery("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearchChange?.("");
  };

  const handleSavePreset = () => {
    const result = savePreset(presetName, currentFilterConfig);
    if (!result.error) setPresetName("");
  };

  const handleStartRename = (preset) => {
    clearPresetError();
    setEditingPresetId(preset.id);
    setEditingPresetName(preset.name);
  };

  const handleRenamePreset = (presetId) => {
    const result = renamePreset(presetId, editingPresetName);
    if (!result.error) {
      setEditingPresetId("");
      setEditingPresetName("");
    }
  };

  const handleDeletePreset = (preset) => {
    if (window.confirm(`Delete the "${preset.name}" filter preset? This cannot be undone.`)) {
      deletePreset(preset.id);
    }
  };

  const handleExport = (format) => {
    setExportMessage("");
    setExportError("");
    try {
      const result = exportEventsResultFile({ events: visibleEvents, filters: currentFilterConfig, format });
      if (!result.ok) {
        setExportError(result.error);
        return;
      }
      setExportMessage(`Exported ${result.count} event${result.count === 1 ? "" : "s"} to ${result.filename}.`);
    } catch {
      setExportError("Unable to export events right now.");
    }
  };

  const suggestionKindLabels = {
    category: "Category", location: "Location", eventType: "Type",
    dateRange: "Date", combination: "Combo", preset: "Preset",
  };

  const hasAnyFilterActive =
    (searchQuery && searchQuery.trim() !== "") ||
    (filterType && filterType !== "all") ||
    (categoryFilter && categoryFilter !== "all");

  // Refined, clean pill styles
  const renderFilterTab = useCallback((tab) => {
    const isActive = filterType === tab.key;
    return (
      <button
        key={tab.key}
        type="button"
        onClick={() => onFilterChange(tab.key)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all border cursor-pointer ${
          isActive
            ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-600/20"
            : "bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-100 border-white/5 hover:border-white/10"
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
  }, [filterType, onFilterChange]);

  const renderCategoryButton = useCallback((cat) => {
    const isActive = categoryFilter === cat.id;
    return (
      <button
        key={cat.id}
        type="button"
        onClick={() => onCategoryChange(cat.id)}
        className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
          isActive
            ? "bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm font-semibold"
            : "bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-100 border-white/5 hover:border-white/10"
        }`}
      >
        {cat.label}
      </button>
    );
  }, [categoryFilter, onCategoryChange]);

  return (
    <div className="sticky top-0 z-30 w-full flex flex-col gap-6 bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-slate-900 shadow-xl">

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-900 pb-5">

        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Filter size={18} className="text-indigo-400" />
            Discover & Refine
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            Refine listed events dynamically based on search, domain category, or schedules.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">

          <button
            type="button"
            onClick={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl border cursor-pointer transition duration-300 ${
              isAdvancedFiltersOpen
                ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850"
            }`}
          >
            <Sparkles
              size={14}
              className={isAdvancedFiltersOpen ? "animate-pulse" : ""}
            />
            Advanced Options
          </button>

          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-2xl bg-red-950/20 text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 transition duration-300 shadow-md cursor-pointer"
            >
              <RotateCcw size={13} />
              Reset Filters
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isAdvancedFiltersOpen
                ? "bg-blue-600 text-white border-blue-500 shadow-sm shadow-blue-600/20"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/5"
            }`}
          >
            <Sparkles size={14} className={isAdvancedFiltersOpen ? "animate-pulse" : ""} />
            Advanced
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilterPanel
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        priceStats={priceStats}
        dateRange={dateRangeStats}
        isOpen={isAdvancedFiltersOpen}
        onToggleOpen={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
      />

      {/* Search + Pills */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">

        {/* Search */}
        <div className="relative flex-1 group">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
          />

          <input
            type="text"
            value={localQuery}
            onChange={handleInput}
            placeholder="Search events by title, description..."
            className="w-full pl-10 pr-10 py-3 text-sm rounded-2xl border border-slate-800 bg-slate-900/60 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />

          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-stretch sm:items-center w-full xl:w-auto overflow-x-auto scrollbar-none">

          {[
            { key: "all", label: "All Events" },
            { key: "live", label: "Live Now" },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past Events" },
          ].map((tab) => {
            const isActive = filterType === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onFilterChange(tab.key)}
                className={`min-w-max flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-300 border ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500"
                    : "bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">

        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Domain Category
        </span>

        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full">

          {CATEGORY_OPTIONS.map((cat) => {
            const isActive = categoryFilter === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border whitespace-nowrap transition duration-300 ${
                  isActive
                    ? "bg-slate-100 text-slate-950 border-slate-200"
                    : "bg-slate-900/50 text-slate-400 border-slate-800/60 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="block md:hidden w-full">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-800 bg-slate-900 text-slate-100"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sort + View */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-t border-slate-900 pt-5">

        <div className="w-full lg:w-auto">
          <StyledDropdown
            label=""
            value={sortType === "" ? "" : sortType}
            onChange={onSortChange}
            options={["Newest", "Upcoming"]}
            placeholder="Sort by Date"
          />
        </div>

        <div className="w-full lg:w-auto flex items-center justify-center space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 shadow-inner">

          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-2.5 rounded-lg transition-all duration-250 ${
              viewMode === "grid"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid size={16} />
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-2.5 rounded-lg transition-all duration-250 ${
              viewMode === "list"
                ? "bg-slate-100 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventFiltersToolbar;

