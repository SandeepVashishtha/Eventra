import assert from "node:assert/strict";

// Mock localStorage globally
const store = {};
globalThis.localStorage = {
  getItem(key) {
    return store[key] || null;
  },
  setItem(key, value) {
    store[key] = String(value);
  },
  clear() {
    for (const key in store) {
      delete store[key];
    }
  }
};

import { isAlreadyRegistered, saveRegistration } from "../src/utils/registerUtils.js";

// Test isAlreadyRegistered when no registrations exist
assert.equal(isAlreadyRegistered("event-1", "user@example.com"), false);

// Test saveRegistration
saveRegistration("event-1", "User@Example.Com");
assert.equal(isAlreadyRegistered("event-1", "user@example.com"), true);

// Test case insensitivity
assert.equal(isAlreadyRegistered("event-1", "USER@EXAMPLE.COM"), true);

// Test saving multiple registrations for the same event
saveRegistration("event-1", "other@example.com");
assert.equal(isAlreadyRegistered("event-1", "other@example.com"), true);
assert.equal(isAlreadyRegistered("event-1", "third@example.com"), false);

// Test saving for a different event
saveRegistration("event-2", "third@example.com");
assert.equal(isAlreadyRegistered("event-2", "third@example.com"), true);
assert.equal(isAlreadyRegistered("event-1", "third@example.com"), false);

// Test corrupted localStorage data is treated as empty
localStorage.clear();
localStorage.setItem("eventRegistrations", "{broken");

let warningCount = 0;
const originalWarn = console.warn;
console.warn = () => {
  warningCount += 1;
};

try {
  assert.equal(isAlreadyRegistered("event-3", "broken@example.com"), false);
  saveRegistration("event-3", "broken@example.com");
  assert.equal(isAlreadyRegistered("event-3", "broken@example.com"), true);
  assert.ok(warningCount >= 1);
} finally {
  console.warn = originalWarn;
}
