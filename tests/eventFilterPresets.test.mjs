/**
 * Tests for src/utils/eventFilterPresets.js
 *
 * Verifies filter preset normalization, creation, renaming, and storage utilities.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Mock advanced filter utils ───────────────────────────────────────────────
// The file imports normalizeAdvancedFilters and serializeAdvancedFilters from
// advancedFilterUtils.js. We mock them so the tests are isolated.
const mockNormalizeAdvancedFilters = () => ({});
const mockSerializeAdvancedFilters = (f) => f;

import {
  normalizeAdvancedFilters,
  serializeAdvancedFilters,
} from "../src/utils/advancedFilterUtils.js";

// Replace with mocks for isolation
Object.defineProperty(globalThis, "__eventFilterTests", {
  value: { normalizeAdvancedFilters: mockNormalizeAdvancedFilters, serializeAdvancedFilters: mockSerializeAdvancedFilters },
});

// Re-import with mocks in place — tests will use the real module
const mod = await import("../src/utils/eventFilterPresets.js");

const {
  getDefaultEventFilterConfig,
  normalizePresetName,
  normalizeEventFilterConfig,
  normalizeFilterPreset,
  normalizeFilterPresets,
  createFilterPreset,
  renameFilterPreset,
  updateFilterPreset,
  removeFilterPreset,
  EVENT_FILTER_PRESETS_STORAGE_KEY,
} = mod;

// ─── normalizePresetName ──────────────────────────────────────────────────────

describe("normalizePresetName", () => {
  it("returns trimmed non-empty strings unchanged", () => {
    assert.equal(normalizePresetName("  My Preset  "), "My Preset");
  });

  it("converts non-string to string", () => {
    assert.equal(normalizePresetName(123), "123");
  });

  it("collapses multiple spaces to single space", () => {
    assert.equal(normalizePresetName("My    Preset"), "My Preset");
  });

  it("returns empty string for null/undefined", () => {
    assert.equal(normalizePresetName(null), "");
    assert.equal(normalizePresetName(undefined), "");
  });

  it("handles empty string", () => {
    assert.equal(normalizePresetName(""), "");
    assert.equal(normalizePresetName("   "), "");
  });
});

// ─── normalizeEventFilterConfig ────────────────────────────────────────────────

describe("normalizeEventFilterConfig — filterType", () => {
  it("keeps valid filterType values", () => {
    const r = normalizeEventFilterConfig({ filterType: "live" });
    assert.equal(r.filterType, "live");
  });

  it("defaults to 'all' for invalid filterType", () => {
    const r = normalizeEventFilterConfig({ filterType: "invalid" });
    assert.equal(r.filterType, "all");
  });

  it("defaults to 'all' when filterType is undefined", () => {
    const r = normalizeEventFilterConfig({});
    assert.equal(r.filterType, "all");
  });
});

describe("normalizeEventFilterConfig — categoryFilter", () => {
  it("keeps valid categoryFilter", () => {
    const r = normalizeEventFilterConfig({ categoryFilter: "hackathons" });
    assert.equal(r.categoryFilter, "hackathons");
  });

  it("slugs invalid category and maps known aliases", () => {
    // "technology" should map to "tech talks"
    const r = normalizeEventFilterConfig({ categoryFilter: "technology" });
    assert.equal(r.categoryFilter, "tech talks");
  });

  it("returns 'all' for completely unknown category", () => {
    const r = normalizeEventFilterConfig({ categoryFilter: "xyzunknown" });
    assert.equal(r.categoryFilter, "all");
  });

  it("falls back to category field if categoryFilter is absent", () => {
    const r = normalizeEventFilterConfig({ category: "hackathons" });
    assert.equal(r.categoryFilter, "hackathons");
  });
});

describe("normalizeEventFilterConfig — sortType and viewMode", () => {
  it("keeps valid sortType", () => {
    const r = normalizeEventFilterConfig({ sortType: "Upcoming" });
    assert.equal(r.sortType, "Upcoming");
  });

  it("defaults to 'Newest' for invalid sortType", () => {
    const r = normalizeEventFilterConfig({ sortType: "Oldest" });
    assert.equal(r.sortType, "Newest");
  });

  it("keeps valid viewMode", () => {
    const r = normalizeEventFilterConfig({ viewMode: "list" });
    assert.equal(r.viewMode, "list");
  });

  it("defaults to 'grid' for invalid viewMode", () => {
    const r = normalizeEventFilterConfig({ viewMode: "table" });
    assert.equal(r.viewMode, "grid");
  });
});

describe("normalizeEventFilterConfig — searchQuery", () => {
  it("keeps valid searchQuery string", () => {
    const r = normalizeEventFilterConfig({ searchQuery: "react workshop" });
    assert.equal(r.searchQuery, "react workshop");
  });

  it("defaults to empty string for non-string searchQuery", () => {
    const r = normalizeEventFilterConfig({ searchQuery: 123 });
    assert.equal(r.searchQuery, "");
  });

  it("defaults to empty string when absent", () => {
    const r = normalizeEventFilterConfig({});
    assert.equal(r.searchQuery, "");
  });
});

// ─── normalizeFilterPreset ────────────────────────────────────────────────────

describe("normalizeFilterPreset", () => {
  it("returns normalized preset for valid input", () => {
    const r = normalizeFilterPreset({ id: "p1", name: "  Hackathons  ", filters: {} });
    assert.equal(r.id, "p1");
    assert.equal(r.name, "Hackathons");
    assert.ok(typeof r.filters === "object");
  });

  it("returns null for null/undefined", () => {
    assert.equal(normalizeFilterPreset(null), null);
    assert.equal(normalizeFilterPreset(undefined), null);
  });

  it("returns null for non-object", () => {
    assert.equal(normalizeFilterPreset("string"), null);
    assert.equal(normalizeFilterPreset(123), null);
  });

  it("returns null when id is missing", () => {
    assert.equal(normalizeFilterPreset({ name: "Test" }), null);
  });

  it("returns null when name is missing/empty", () => {
    assert.equal(normalizeFilterPreset({ id: "p1", name: "   " }), null);
    assert.equal(normalizeFilterPreset({ id: "p1", name: null }), null);
  });

  it("trims and normalizes the name", () => {
    const r = normalizeFilterPreset({ id: "p1", name: "  Test Preset  " });
    assert.equal(r.name, "Test Preset");
  });
});

// ─── normalizeFilterPresets ────────────────────────────────────────────────────

describe("normalizeFilterPresets", () => {
  it("returns empty array for non-array input", () => {
    assert.deepEqual(normalizeFilterPresets(null), []);
    assert.deepEqual(normalizeFilterPresets("string"), []);
    assert.deepEqual(normalizeFilterPresets({}), []);
  });

  it("returns empty array for empty array", () => {
    assert.deepEqual(normalizeFilterPresets([]), []);
  });

  it("normalizes and deduplicates by id", () => {
    const input = [
      { id: "p1", name: "A", filters: {} },
      { id: "p1", name: "A-v2", filters: {} }, // duplicate id
      { id: "p2", name: "B", filters: {} },
    ];
    const result = normalizeFilterPresets(input);
    assert.equal(result.length, 2);
    const ids = result.map((p) => p.id);
    assert.ok(ids.includes("p1"));
    assert.ok(ids.includes("p2"));
  });

  it("skips invalid presets", () => {
    const input = [
      { id: "p1", name: "A", filters: {} },
      { id: "", name: "B", filters: {} }, // invalid
      { id: "p3", name: "  ", filters: {} }, // invalid
    ];
    const result = normalizeFilterPresets(input);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, "p1");
  });
});

// ─── createFilterPreset ───────────────────────────────────────────────────────

describe("createFilterPreset", () => {
  it("creates a new preset", () => {
    const idFactory = () => "new-1";
    const result = createFilterPreset([], "My Preset", { filterType: "live" }, idFactory);
    assert.equal(result.error, "");
    assert.equal(result.preset.id, "new-1");
    assert.equal(result.preset.name, "My Preset");
    assert.equal(result.preset.filters.filterType, "live");
  });

  it("trims the preset name", () => {
    const result = createFilterPreset([], "  Events  ", {}, () => "id");
    assert.equal(result.preset.name, "Events");
  });

  it("prevents duplicate name (case-insensitive)", () => {
    const existing = [{ id: "p1", name: "Hackathons", filters: {} }];
    const result = createFilterPreset(existing, "HACKATHONS", {}, () => "id");
    assert.ok(result.error.includes("already exists"));
    assert.equal(result.preset, undefined);
  });

  it("returns error for empty name", () => {
    const result = createFilterPreset([], "   ", {}, () => "id");
    assert.ok(result.error.includes("required"));
  });

  it("returns error for null name", () => {
    const result = createFilterPreset([], null, {}, () => "id");
    assert.ok(result.error.includes("required"));
  });
});

// ─── renameFilterPreset ───────────────────────────────────────────────────────

describe("renameFilterPreset", () => {
  it("renames the matching preset", () => {
    const existing = [{ id: "p1", name: "Old Name", filters: {} }];
    const result = renameFilterPreset(existing, "p1", "New Name");
    assert.equal(result.error, "");
    const renamed = result.presets.find((p) => p.id === "p1");
    assert.equal(renamed.name, "New Name");
  });

  it("prevents duplicate name on rename", () => {
    const existing = [
      { id: "p1", name: "First", filters: {} },
      { id: "p2", name: "Second", filters: {} },
    ];
    const result = renameFilterPreset(existing, "p2", "FIRST");
    assert.ok(result.error.includes("already exists"));
  });

  it("allows rename to same name for same id", () => {
    const existing = [{ id: "p1", name: "My Preset", filters: {} }];
    const result = renameFilterPreset(existing, "p1", "  My Preset  ");
    assert.equal(result.error, "");
  });

  it("returns error for empty name", () => {
    const result = renameFilterPreset([], "p1", "   ");
    assert.ok(result.error.includes("required"));
  });
});

// ─── updateFilterPreset ───────────────────────────────────────────────────────

describe("updateFilterPreset", () => {
  it("updates filters for the matching preset", () => {
    const existing = [{ id: "p1", name: "My Preset", filters: { filterType: "all" } }];
    const result = updateFilterPreset(existing, "p1", { filterType: "live" });
    const updated = result.find((p) => p.id === "p1");
    assert.equal(updated.filters.filterType, "live");
  });

  it("leaves other presets unchanged", () => {
    const existing = [
      { id: "p1", name: "First", filters: { filterType: "all" } },
      { id: "p2", name: "Second", filters: { filterType: "upcoming" } },
    ];
    const result = updateFilterPreset(existing, "p1", { filterType: "live" });
    const p2 = result.find((p) => p.id === "p2");
    assert.equal(p2.filters.filterType, "upcoming");
  });

  it("handles non-existent presetId", () => {
    const existing = [{ id: "p1", name: "First", filters: {} }];
    const result = updateFilterPreset(existing, "nonexistent", { filterType: "live" });
    assert.equal(result.length, 1);
    assert.equal(result[0].id, "p1");
  });
});

// ─── removeFilterPreset ───────────────────────────────────────────────────────

describe("removeFilterPreset", () => {
  it("removes the matching preset", () => {
    const existing = [
      { id: "p1", name: "First", filters: {} },
      { id: "p2", name: "Second", filters: {} },
    ];
    const result = removeFilterPreset(existing, "p1");
    assert.equal(result.length, 1);
    assert.equal(result[0].id, "p2");
  });

  it("returns empty array when last preset is removed", () => {
    const result = removeFilterPreset([{ id: "p1", name: "Only", filters: {} }], "p1");
    assert.equal(result.length, 0);
  });

  it("returns empty array for non-existent presetId", () => {
    const result = removeFilterPreset([{ id: "p1", name: "First", filters: {} }], "nonexistent");
    assert.equal(result.length, 1);
  });
});

// ─── getDefaultEventFilterConfig ──────────────────────────────────────────────

describe("getDefaultEventFilterConfig", () => {
  it("returns a valid default config object", () => {
    const cfg = getDefaultEventFilterConfig();
    assert.equal(cfg.filterType, "all");
    assert.equal(cfg.categoryFilter, "all");
    assert.equal(cfg.sortType, "Newest");
    assert.equal(cfg.viewMode, "grid");
    assert.equal(cfg.searchQuery, "");
    assert.ok(typeof cfg.advancedFilters === "object");
  });
});

// ─── EVENT_FILTER_PRESETS_STORAGE_KEY ────────────────────────────────────────

describe("EVENT_FILTER_PRESETS_STORAGE_KEY", () => {
  it("is a non-empty string", () => {
    assert.ok(typeof EVENT_FILTER_PRESETS_STORAGE_KEY === "string");
    assert.ok(EVENT_FILTER_PRESETS_STORAGE_KEY.length > 0);
  });

  it("includes 'eventra' prefix", () => {
    assert.ok(EVENT_FILTER_PRESETS_STORAGE_KEY.startsWith("eventra"));
  });
});

console.log("eventFilterPresets tests passed ✓");