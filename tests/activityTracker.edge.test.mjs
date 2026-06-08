import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = String(value);
  },
};

const { trackUserInterest } = await import("../src/utils/activityTracker.js");

assert.doesNotThrow(() => trackUserInterest(null));
assert.doesNotThrow(() => trackUserInterest(undefined));
assert.doesNotThrow(() => trackUserInterest(""));
assert.equal(store["eventra_user_profile"], undefined, "invalid interests should not write profile");

trackUserInterest("design");
assert.ok(JSON.parse(store["eventra_user_profile"]).interests.includes("design"));

store["eventra_user_profile"] = "[]";
assert.doesNotThrow(() => trackUserInterest("coding"));
assert.deepEqual(JSON.parse(store["eventra_user_profile"]).interests, ["coding"]);

console.log("activityTracker edge-case tests passed ✓");
