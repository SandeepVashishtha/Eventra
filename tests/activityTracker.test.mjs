import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); }
};

import { trackUserInterest } from "../src/utils/activityTracker.js";

trackUserInterest("design");
const profile = JSON.parse(store["eventra_user_profile"]);
assert.ok(profile.interests.includes("design"));

console.log("activityTracker tests passed ✓");
