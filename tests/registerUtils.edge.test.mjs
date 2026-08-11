import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
};

const { isAlreadyRegistered, saveRegistration } = await import(
  "../src/utils/registerUtils.js"
);

assert.equal(isAlreadyRegistered("", "user@example.com"), false);
assert.equal(isAlreadyRegistered("event-1", ""), false);
assert.equal(isAlreadyRegistered("event-1", "   "), false);

saveRegistration("event-1", "  User@Example.Com  ");
assert.equal(isAlreadyRegistered("event-1", "user@example.com"), true);

saveRegistration("event-1", "user@example.com");
assert.equal(
  JSON.parse(localStorage.getItem("eventRegistrations"))["event-1"].length,
  1,
  "duplicate saveRegistration is idempotent"
);

console.log("registerUtils edge-case tests passed ✓");
