import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); }
};

import { saveToOfflineCache, getFromOfflineCache } from "../src/utils/indexedDB.js";

await saveToOfflineCache("test_key", "test_value");
const res = await getFromOfflineCache("test_key");
assert.equal(res, "test_value");

console.log("indexedDB tests passed ✓");
