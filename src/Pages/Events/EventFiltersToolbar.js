import {
  Grid,
  List,
  Calendar,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Filter,
  Save,
  Pencil,
  Trash2,
  Upload,
  RefreshCcw,
  Download,
} from "lucide-react";
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
  totalElements = 0,
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
      const result = exportEventsResultFile({
        events: visibleEvents,
        filters: currentFilterConfig,
        format,
      });
      if (!result.ok) {
        setExportError(result.error);
        return;
      }
      setExportMessage(
        `Exported ${result.count} event${result.count === 1 ? "" : "s"} to ${result.filename}.`
      );
    } catch {
      setExportError("Unable to export events right now.");
    }
  };

  const suggestionKindLabels = {
    category: "Category",
    location: "Location",
    eventType: "Type",
    dateRange: "Date",
    combination: "Combo",
    preset: "Preset",
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
        (advancedFilters.priceRange &&
          (advancedFilters.priceRange.min > 0 || advancedFilters.priceRange.max < Infinity))));

  // Refined, clean pill styles
  const renderFilterTab = useCallback(
    (tab) => {
      const isActive = filterType === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onFilterChange(tab.key)}
          className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
            isActive
              ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
              : "border-white/5 bg-zinc-800/50 text-zinc-400 hover:border-white/10 hover:bg-zinc-700/50 hover:text-zinc-100"
          }`}
        >
          {tab.pulse && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          )}
          {tab.label}
        </button>
      );
    },
    [filterType, onFilterChange]
  );

  const renderCategoryButton = useCallback(
    (cat) => {
      const isActive = categoryFilter === cat.id;
      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => onCategoryChange(cat.id)}
          className={`cursor-pointer rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
            isActive
              ? "border-zinc-200 bg-zinc-100 font-semibold text-zinc-900 shadow-sm"
              : "border-white/5 bg-zinc-800/50 text-zinc-400 hover:border-white/10 hover:bg-zinc-700/50 hover:text-zinc-100"
          }`}
        >
          {cat.label}
        </button>
      );
    },
    [categoryFilter, onCategoryChange]
  );

  return (
    <div className="flex w-full flex-col gap-5 rounded-2xl border border-white/5 bg-zinc-900/60 p-5 shadow-2xl ring-1 shadow-black/40 ring-white/5 backdrop-blur-xl sm:p-6">
      {/* 1. Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2">
            <Filter size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">Event Filters</h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              Refine and discover events with precision.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
          {hasAnyFilterActive && (
            <button
              type="button"
              onClick={onResetFilters}
              className="ml-auto flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20 md:ml-0"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              isAdvancedFiltersOpen
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "border-white/5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            <Sparkles size={14} className={isAdvancedFiltersOpen ? "animate-pulse" : ""} />
            Advanced
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AdvancedFilterPanel
        filters={advancedFilters}
        onFiltersChange={onAdvancedFiltersChange}
        priceStats={priceStats}
        dateRange={dateRangeStats}
        isOpen={isAdvancedFiltersOpen}
        onToggleOpen={() => onToggleAdvancedFilters?.((isOpen) => !isOpen)}
      />

      {/* 2. Command Center: Search, Sort, View Modes */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="group relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-blue-400"
          />
          <input
            type="text"
            value={localQuery}
            onChange={handleInput}
            placeholder="Search events by title, speaker, or topic..."
            aria-label="Search events"
            className="w-full rounded-xl border border-white/5 bg-zinc-800/50 py-2.5 pr-10 pl-11 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full lg:w-44">
            <StyledDropdown
              label=""
              value={sortType === "" ? "" : sortType}
              onChange={onSortChange}
              options={["Newest", "Upcoming"]}
              placeholder="Sort by Date"
            />
          </div>

          <div className="flex shrink-0 items-center rounded-xl border border-white/5 bg-zinc-800/50 p-1">
            {[
              { mode: "grid", icon: Grid, label: "Grid view" },
              { mode: "list", icon: List, label: "List view" },
              { mode: "calendar", icon: Calendar, label: "Calendar view" },
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewModeChange(mode)}
                className={`flex cursor-pointer items-center justify-center rounded-lg p-2 transition-all ${
                  viewMode === mode
                    ? "bg-zinc-100 text-zinc-900 shadow-sm"
                    : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100"
                }`}
                aria-label={label}
                aria-pressed={viewMode === mode}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Quick Filters: Status & Categories */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-800/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-zinc-500">Status:</span>
          {[
            { key: "all", label: "All Events" },
            { key: "live", label: "Live Now", pulse: true },
            { key: "upcoming", label: "Upcoming" },
            { key: "past", label: "Past Events" },
          ].map(renderFilterTab)}
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-zinc-500">Category:</span>
          <div className="hidden max-w-full scrollbar-none items-center gap-2 overflow-x-auto pb-1 md:flex">
            {CATEGORY_OPTIONS.map(renderCategoryButton)}
          </div>
          <div className="relative block w-full md:hidden">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-white/5 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-zinc-900 text-zinc-100">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Suggested Filters */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <h4 className="text-sm font-medium text-zinc-300">Suggested for you</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => onApplyPreset?.(suggestion.filters)}
                className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-white/5 bg-zinc-800/60 px-3 py-1.5 text-left text-xs font-medium text-zinc-300 transition-all hover:border-white/10 hover:bg-zinc-700/60 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                title={suggestion.reason}
              >
                <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] tracking-wider text-zinc-400 uppercase">
                  {suggestionKindLabels[suggestion.kind] || "Filter"}
                </span>
                <span className="truncate">{suggestion.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Presets & Export (Grid Layout for better space management) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Saved Presets Card */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-800/30 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Save size={14} className="text-blue-400" /> Saved Presets
          </h4>

          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={presetName}
              onChange={(event) => {
                clearPresetError();
                setPresetName(event.target.value);
              }}
              placeholder="New preset name..."
              className="min-w-0 flex-1 rounded-lg border border-white/5 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={handleSavePreset}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-500"
            >
              <Save size={14} /> Save
            </button>
          </div>

          {presetError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
              {presetError}
            </p>
          )}

          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {presets.length === 0 ? (
              <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-sm text-zinc-500">
                No saved presets yet.
              </p>
            ) : (
              presets.map((preset) => {
                const isEditing = editingPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className="flex flex-col gap-2 rounded-lg border border-white/5 bg-zinc-900/40 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingPresetName}
                          onChange={(event) => {
                            clearPresetError();
                            setEditingPresetName(event.target.value);
                          }}
                          className="flex-1 rounded-md border border-white/10 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
                          aria-label={`Rename ${preset.name}`}
                        />
                      ) : (
                        <p className="flex-1 truncate text-sm font-medium text-zinc-200">
                          {preset.name}
                        </p>
                      )}

                      {/* Clean Icon-Only Actions */}
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => onApplyPreset?.(preset.filters)}
                          title="Apply preset"
                          className="rounded-md p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                        >
                          <Upload size={14} />
                        </button>
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => handleRenamePreset(preset.id)}
                            title="Save name"
                            className="rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-500/10"
                          >
                            <Save size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartRename(preset)}
                            title="Edit name"
                            className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-700"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => updatePreset(preset.id, currentFilterConfig)}
                          title="Update with current filters"
                          className="rounded-md p-1.5 text-blue-400 transition-colors hover:bg-blue-500/10"
                        >
                          <RefreshCcw size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset)}
                          title="Delete preset"
                          className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Export Data Card */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-zinc-800/30 p-4">
          <h4 className="flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Download size={14} className="text-emerald-400" /> Export Data
          </h4>
          <p className="text-xs text-zinc-500">Download the currently visible filtered events.</p>

          <div className="mt-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={visibleEvents.length === 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-800/50 disabled:text-zinc-600"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("json")}
              disabled={visibleEvents.length === 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-zinc-800/50 disabled:text-zinc-600"
            >
              <Download size={14} /> Export JSON
            </button>
          </div>

          {visibleEvents.length === 0 && (
            <p className="text-xs text-zinc-500 italic">
              Export is disabled because there are no visible events.
            </p>
          )}
          {exportMessage && (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
              {exportMessage}
            </p>
          )}
          {exportError && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300">
              {exportError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(EventFiltersToolbar);
