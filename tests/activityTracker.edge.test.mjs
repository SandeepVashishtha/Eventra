import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => {
    store[key] = String(value);
  },
};

const { trackUserInterest } = await import("../src/utils/activityTracker.js");

await trackUserInterest(null);
await trackUserInterest(undefined);
await trackUserInterest("");
assert.equal(store["eventra_user_profile"], undefined, "invalid interests should not write profile");

await trackUserInterest("design");
assert.ok(JSON.parse(store["eventra_user_profile"]).interests.includes("design"));

store["eventra_user_profile"] = "[]";
await trackUserInterest("coding");
assert.deepEqual(JSON.parse(store["eventra_user_profile"]).interests, ["coding"]);

console.log("activityTracker edge-case tests passed ✓");
