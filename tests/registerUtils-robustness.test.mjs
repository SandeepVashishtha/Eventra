import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem(key) {
    return store[key] || null;
  },
  setItem(key, value) {
    store[key] = String(value);
  },
  removeItem(key) {
    delete store[key];
  },
  clear() {
    for (const key in store) {
      delete store[key];
    }
  }
};

import { isAlreadyRegistered, saveRegistration } from "../src/utils/registerUtils.js";

localStorage.clear();

assert.equal(isAlreadyRegistered(null, "test@example.com"), false, "null eventId returns false");
assert.equal(isAlreadyRegistered(undefined, "test@example.com"), false, "undefined eventId returns false");
assert.equal(isAlreadyRegistered("event-1", null), false, "null email returns false");
assert.equal(isAlreadyRegistered("event-1", ""), false, "empty email returns false");
assert.equal(isAlreadyRegistered("", "test@example.com"), false, "empty eventId returns false");

saveRegistration(null, null);
saveRegistration(undefined, undefined);
saveRegistration("", "");

saveRegistration("event-1", "  Test@Example.COM  ");
assert.equal(isAlreadyRegistered("event-1", "test@example.com"), true, "whitespace trimmed and case normalized");

const originalWarn = console.warn;
let warnCalled = false;
console.warn = () => { warnCalled = true; };

store["eventRegistrations"] = null;
assert.equal(isAlreadyRegistered("event-1", "test@example.com"), false, "null stored data treated as empty");

store["eventRegistrations"] = "not valid json";
assert.equal(isAlreadyRegistered("event-1", "test@example.com"), false, "invalid JSON handled gracefully");

console.warn = originalWarn;

console.log("registerUtils robustness tests passed ✓");