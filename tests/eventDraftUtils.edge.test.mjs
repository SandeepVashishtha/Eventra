import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
};

const { saveDraft, getDraft, clearDraft } = await import(
  "../src/utils/eventDraftUtils.js"
);

assert.equal(getDraft(), null, "returns null when no draft exists");

localStorage.setItem("event_creation_draft", "{not-json");
assert.deepEqual(getDraft(), {}, "returns empty object for malformed draft JSON");

saveDraft({ title: "Draft event", step: 2 });
assert.deepEqual(getDraft(), { title: "Draft event", step: 2 });

clearDraft();
assert.equal(getDraft(), null, "clearDraft removes stored draft");

console.log("eventDraftUtils edge-case tests passed ✓");
