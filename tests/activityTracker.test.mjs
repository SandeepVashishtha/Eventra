import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  }
};

import { trackUserInterest } from "../src/utils/activityTracker.js";

// Test 1: Standard functional interest tracking
store["eventra_user_profile"] = null;
trackUserInterest("design");
let profile = JSON.parse(store["eventra_user_profile"]);
assert.ok(profile.interests.includes("design"), "Should add design to interests");

// Track another interest
trackUserInterest("coding");
profile = JSON.parse(store["eventra_user_profile"]);
assert.deepEqual(profile.interests, ["design", "coding"], "Should maintain both interests");

// Test 2: Handle corrupt / invalid JSON in localStorage gracefully without stack overflow
store["eventra_user_profile"] = "{invalid-json-corrupt-data";
assert.doesNotThrow(() => {
  trackUserInterest("hacking");
}, "Should not throw or cause infinite recursion stack overflow on corrupted JSON");

profile = JSON.parse(store["eventra_user_profile"]);
assert.deepEqual(profile.interests, ["hacking"], "Should successfully reset corrupt storage and add hacking");

// Test 3: Handle complete localStorage write failure gracefully
globalThis.localStorage.setItem = () => {
  throw new Error("QuotaExceededError");
};

assert.doesNotThrow(() => {
  trackUserInterest("security");
}, "Should handle storage write failures gracefully without infinite recursion");

console.log("activityTracker tests passed ✓");
