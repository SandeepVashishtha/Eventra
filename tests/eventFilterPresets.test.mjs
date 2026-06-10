import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  createFilterPreset,
  getDefaultEventFilterConfig,
  normalizeEventFilterConfig,
  readFilterPresets,
  removeFilterPreset,
  renameFilterPreset,
  updateFilterPreset,
  writeFilterPresets,
} from "../src/utils/eventFilterPresets.js";

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
};

const filters = {
  searchQuery: "react",
  filterType: "upcoming",
  categoryFilter: "web-development",
  sortType: "Upcoming",
  viewMode: "list",
  advancedFilters: {
    modes: ["online"],
    location: "Remote",
    priceRange: { min: 0, max: 0 },
  },
};

describe("eventFilterPresets", () => {
  it("saves presets with normalized filter values", () => {
    const result = createFilterPreset([], " Tech Events ", filters, () => "preset-1");

    assert.equal(result.error, "");
    assert.equal(result.preset.name, "Tech Events");
    assert.deepEqual(result.preset.filters, normalizeEventFilterConfig(filters));
  });

  it("rejects empty and duplicate preset names", () => {
    const first = createFilterPreset([], "Free Online", filters, () => "preset-1");
    const empty = createFilterPreset(first.presets, "   ", filters, () => "preset-2");
    const duplicate = createFilterPreset(first.presets, "free online", filters, () => "preset-3");

    assert.equal(empty.error, "Preset name is required.");
    assert.equal(duplicate.error, "A preset with this name already exists.");
    assert.equal(empty.presets.length, 1);
    assert.equal(duplicate.presets.length, 1);
  });

  it("persists presets to local storage and loads them back", () => {
    const storage = createStorage();
    const saved = createFilterPreset([], "Remote React", filters, () => "preset-1");

    writeFilterPresets(saved.presets, storage, "presets");
    const loaded = readFilterPresets(storage, "presets");

    assert.deepEqual(loaded, saved.presets);
  });

  it("applies legacy preset fields into supported filter state", () => {
    const normalized = normalizeEventFilterConfig({
      category: "Technology",
      location: "Online",
      dateRange: "this_week",
      price: "free",
      filterType: "unsupported",
      viewMode: "board",
    });

    assert.equal(normalized.categoryFilter, "tech talks");
    assert.equal(normalized.filterType, "all");
    assert.equal(normalized.viewMode, "grid");
    assert.equal(normalized.advancedFilters.location, "Online");
    assert.deepEqual(normalized.advancedFilters.priceRange, { min: 0, max: 0 });
    assert.equal(normalized.advancedFilters.dateRange, undefined);
  });

  it("updates an existing preset with current filters", () => {
    const saved = createFilterPreset([], "Initial", filters, () => "preset-1");
    const nextFilters = {
      ...getDefaultEventFilterConfig(),
      searchQuery: "cloud",
      categoryFilter: "devops-cloud",
    };

    const updated = updateFilterPreset(saved.presets, "preset-1", nextFilters);

    assert.equal(updated[0].name, "Initial");
    assert.equal(updated[0].filters.searchQuery, "cloud");
    assert.equal(updated[0].filters.categoryFilter, "devops-cloud");
  });

  it("renames and deletes presets", () => {
    const saved = createFilterPreset([], "Initial", filters, () => "preset-1");
    const renamed = renameFilterPreset(saved.presets, "preset-1", "Renamed");
    const deleted = removeFilterPreset(renamed.presets, "preset-1");

    assert.equal(renamed.error, "");
    assert.equal(renamed.presets[0].name, "Renamed");
    assert.deepEqual(deleted, []);
  });

  it("recovers from corrupted storage by clearing the bad value", () => {
    const storage = createStorage();
    storage.setItem("presets", "{bad json");

    const loaded = readFilterPresets(storage, "presets");

    assert.deepEqual(loaded, []);
    assert.equal(storage.has("presets"), false);
  });
});

console.log("eventFilterPresets tests passed");
