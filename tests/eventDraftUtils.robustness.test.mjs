import assert from "node:assert/strict";
import { saveDraft, getDraft, clearDraft } from "../src/utils/eventDraftUtils.js";

const store = {};
globalThis.localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};

saveDraft({ title: "Draft Event" });
const draft = getDraft();
assert.equal(draft.title, "Draft Event");
clearDraft();
assert.equal(getDraft(), null);
console.log("eventDraftUtils robustness tests passed ✓");
