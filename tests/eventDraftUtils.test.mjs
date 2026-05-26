import assert from "node:assert/strict";

// Mock localStorage globally
let store = {};
let throwError = false;

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
assert.deepEqual(getDraft(), draftData);

// Test clearDraft
clearDraft();
assert.equal(getDraft(), null);

// Test storage exception graceful handling
throwError = true;
// Should not throw exceptions but handle gracefully internally
saveDraft(draftData);
assert.equal(getDraft(), null);
clearDraft();
