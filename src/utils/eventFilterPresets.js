import { normalizeAdvancedFilters, serializeAdvancedFilters } from "./advancedFilterUtils.js";

export const EVENT_FILTER_PRESETS_STORAGE_KEY = "eventra:event-filter-presets:v1";

const FILTER_TYPES = new Set(["all", "live", "upcoming", "past"]);
const CATEGORY_FILTERS = new Set([
  "all",
  "hackathons",
  "tech talks",
  "web-development",
  "ai-ml",
  "devops-cloud",
  "web3-blockchain",
  "mobile",
  "design-ux",
  "cultural",
]);
const SORT_TYPES = new Set(["Newest", "Upcoming"]);
const VIEW_MODES = new Set(["grid", "list"]);

export const getDefaultEventFilterConfig = () => ({
  searchQuery: "",
  filterType: "all",
  categoryFilter: "all",
  sortType: "Newest",
  viewMode: "grid",
  advancedFilters: normalizeAdvancedFilters(),
});

const normalizeSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizePresetName = (name) =>
  String(name || "").replace(/\s+/g, " ").trim();

const normalizeCategoryFilter = (value) => {
  const raw = String(value || "").trim();
  if (CATEGORY_FILTERS.has(raw)) return raw;

  const slug = normalizeSlug(raw);
  if (CATEGORY_FILTERS.has(slug)) return slug;
  if (slug === "technology") return "tech talks";
  if (slug === "online") return "all";
  return "all";
};

const normalizePriceRange = (price) => {
  if (!price) return null;
  if (typeof price === "string" && normalizeSlug(price) === "free") {
    return { min: 0, max: 0 };
  }
  if (typeof price === "object") {
    return {
      min: Number(price.min) || 0,
      max: price.max === Infinity ? Infinity : Number(price.max) || 0,
    };
  }
  return null;
};

export const normalizeEventFilterConfig = (filters = {}) => {
  const defaults = getDefaultEventFilterConfig();
  const advancedInput = filters.advancedFilters || {};
  const legacyPriceRange = normalizePriceRange(filters.price);
  const legacyLocation =
    typeof filters.location === "string" ? filters.location.trim() : "";

  const advancedFilters = normalizeAdvancedFilters({
    ...advancedInput,
    location: advancedInput.location || legacyLocation,
    priceRange: advancedInput.priceRange || legacyPriceRange,
    dateRange:
      typeof filters.dateRange === "object"
        ? filters.dateRange
        : advancedInput.dateRange,
  });

  const filterType = FILTER_TYPES.has(filters.filterType)
    ? filters.filterType
    : defaults.filterType;
  const sortType = SORT_TYPES.has(filters.sortType)
    ? filters.sortType
    : defaults.sortType;
  const viewMode = VIEW_MODES.has(filters.viewMode)
    ? filters.viewMode
    : defaults.viewMode;

  return {
    searchQuery:
      typeof filters.searchQuery === "string" ? filters.searchQuery : "",
    filterType,
    categoryFilter: normalizeCategoryFilter(
      filters.categoryFilter || filters.category,
    ),
    sortType,
    viewMode,
    advancedFilters: serializeAdvancedFilters(advancedFilters),
  };
};

export const normalizeFilterPreset = (preset) => {
  if (!preset || typeof preset !== "object") return null;

  const id = String(preset.id || "").trim();
  const name = normalizePresetName(preset.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    filters: normalizeEventFilterConfig(preset.filters),
  };
};

export const normalizeFilterPresets = (value) => {
  if (!Array.isArray(value)) return [];

  const seenIds = new Set();
  return value.reduce((presets, preset) => {
    const normalized = normalizeFilterPreset(preset);
    if (!normalized || seenIds.has(normalized.id)) return presets;
    seenIds.add(normalized.id);
    presets.push(normalized);
    return presets;
  }, []);
};

export const readFilterPresets = (
  storage = globalThis.localStorage,
  key = EVENT_FILTER_PRESETS_STORAGE_KEY,
) => {
  if (!storage?.getItem) return [];

  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const payload = Array.isArray(parsed) ? parsed : parsed?.presets;
    const presets = normalizeFilterPresets(payload);

    if (!Array.isArray(payload)) {
      storage.removeItem?.(key);
      return [];
    }

    return presets;
  } catch {
    storage.removeItem?.(key);
    return [];
  }
};

export const writeFilterPresets = (
  presets,
  storage = globalThis.localStorage,
  key = EVENT_FILTER_PRESETS_STORAGE_KEY,
) => {
  const normalized = normalizeFilterPresets(presets);
  if (!storage?.setItem) return normalized;
  storage.setItem(key, JSON.stringify(normalized));
  return normalized;
};

export const createFilterPreset = (
  presets,
  name,
  filters,
  idFactory = () => `preset-${Date.now()}`,
) => {
  const normalizedName = normalizePresetName(name);
  const existing = normalizeFilterPresets(presets);

  if (!normalizedName) {
    return { presets: existing, error: "Preset name is required." };
  }

  const duplicate = existing.some(
    (preset) => preset.name.toLowerCase() === normalizedName.toLowerCase(),
  );
  if (duplicate) {
    return {
      presets: existing,
      error: "A preset with this name already exists.",
    };
  }

  const preset = {
    id: idFactory(),
    name: normalizedName,
    filters: normalizeEventFilterConfig(filters),
  };

  return { presets: [...existing, preset], preset, error: "" };
};

export const renameFilterPreset = (presets, presetId, name) => {
  const normalizedName = normalizePresetName(name);
  const existing = normalizeFilterPresets(presets);

  if (!normalizedName) {
    return { presets: existing, error: "Preset name is required." };
  }

  const duplicate = existing.some(
    (preset) =>
      preset.id !== presetId &&
      preset.name.toLowerCase() === normalizedName.toLowerCase(),
  );
  if (duplicate) {
    return {
      presets: existing,
      error: "A preset with this name already exists.",
    };
  }

  return {
    presets: existing.map((preset) =>
      preset.id === presetId ? { ...preset, name: normalizedName } : preset,
    ),
    error: "",
  };
};

export const updateFilterPreset = (presets, presetId, filters) => {
  const existing = normalizeFilterPresets(presets);
  return existing.map((preset) =>
    preset.id === presetId
      ? { ...preset, filters: normalizeEventFilterConfig(filters) }
      : preset,
  );
};

export const removeFilterPreset = (presets, presetId) =>
  normalizeFilterPresets(presets).filter((preset) => preset.id !== presetId);
