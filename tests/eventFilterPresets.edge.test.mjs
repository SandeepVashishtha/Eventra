import assert from "node:assert/strict";
import { getDefaultEventFilterConfig, normalizePresetName } from "../src/utils/eventFilterPresets.js";

const config = getDefaultEventFilterConfig();
assert.equal(config.filterType, "all");
assert.equal(config.viewMode, "grid");

assert.equal(normalizePresetName("  My Preset  "), "My Preset");
console.log("eventFilterPresets edge tests passed ✓");
