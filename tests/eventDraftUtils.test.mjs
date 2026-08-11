import assert from "node:assert/strict";

// Mock localStorage and window globally
let store = {};
let throwError = false;

globalThis.window = globalThis; // So isStorageAvailable() sees window.localStorage
globalThis.localStorage = {
  getItem(key) {
    if (throwError) throw new Error("Storage simulated error");
    return store[key] || null;
  },
  setItem(key, value) {
    if (throwError) throw new Error("Storage simulated error");
    store[key] = String(value);
  },
  removeItem(key) {
    if (throwError) throw new Error("Storage simulated error");
    delete store[key];
  }
};

import { saveDraft, getDraft, clearDraft } from "../src/utils/eventDraftUtils.js";

// Test getDraft when empty
assert.equal(getDraft(), null);

// Test saveDraft and getDraft
const draftData = { title: "Super Hackathon", description: "Awesome builders event" };
saveDraft(draftData);
const loaded = getDraft();
assert.ok(loaded);
assert.deepEqual(loaded.data, draftData);
assert.ok(loaded.savedAt);

// Test clearDraft
clearDraft();
assert.equal(getDraft(), null);

// Test storage exception graceful handling
throwError = true;
// Should not throw exceptions but handle gracefully internally
saveDraft(draftData);
assert.equal(getDraft(), null);
clearDraft();

// Edge Case: Save empty draft data
throwError = false;
saveDraft({});
assert.deepEqual(getDraft()?.data, {});

// Edge Case: Save null/invalid draft data
saveDraft(null);
assert.equal(getDraft(), null);

// Edge Case: Gracefully handling corrupted/non-JSON storage strings
store["event_creation_draft"] = "{malformed-json";
assert.equal(getDraft(), null, "should return null for corrupted draft storage");
