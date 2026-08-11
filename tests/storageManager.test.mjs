import assert from "node:assert/strict";

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
};

// Mock Date.now so we can simulate TTL expiry
const realDateNow = Date.now.bind(Date);
let mockNow = realDateNow();
Date.now = () => mockNow;

// Import after globals are in place
const { storageManager } = await import("../src/utils/storage/storageManager.js");

try {
  // ── Test 1: set + get round-trip ──────────────────────────────────────────
  localStorage.clear();
  storageManager.set("user", { name: "Alice" });
  const val = storageManager.get("user");
  assert.deepEqual(val, { name: "Alice" }, "Should retrieve the stored value");

  // ── Test 2: get returns null for missing key ──────────────────────────────
  assert.equal(storageManager.get("nonexistent"), null, "Missing key returns null");

  // ── Test 3: TTL expiry evicts item ────────────────────────────────────────
  const ONE_HOUR = 1000 * 60 * 60;
  storageManager.set("temp", "hello", ONE_HOUR);
  mockNow += ONE_HOUR + 1;            // advance past expiry
  assert.equal(storageManager.get("temp"), null, "Expired item should return null");
  assert.equal(localStorage.getItem("temp"), null, "Expired item should be removed from store");
  mockNow = realDateNow();             // reset time

  // ── Test 4: optional validator accepts valid value ─────────────────────────
  storageManager.set("num", 42);
  const v4 = storageManager.get("num", (v) => typeof v === "number");
  assert.equal(v4, 42, "Validator should accept a number value");

  // ── Test 5: optional validator rejects invalid value ──────────────────────
  storageManager.set("num2", "not-a-number");
  const v5 = storageManager.get("num2", (v) => typeof v === "number");
  assert.equal(v5, null, "Validator should reject a non-number value");
  assert.equal(localStorage.getItem("num2"), null, "Rejected item should be removed");

  // ── Test 6: get handles corrupted JSON gracefully ─────────────────────────
  localStorage.setItem("corrupt", "this is not json{{");
  assert.equal(storageManager.get("corrupt"), null, "Corrupted JSON returns null");
  assert.equal(localStorage.getItem("corrupt"), null, "Corrupted JSON item is removed");

  // ── Test 7: remove deletes the key ────────────────────────────────────────
  storageManager.set("toDelete", "bye");
  storageManager.remove("toDelete");
  assert.equal(storageManager.get("toDelete"), null, "Removed item should be gone");

  // ── Test 8: clear wipes all keys ──────────────────────────────────────────
  storageManager.set("a", 1);
  storageManager.set("b", 2);
  storageManager.clear();
  assert.equal(Object.keys(store).length, 0, "clear() should wipe all keys");

  console.log("storageManager tests passed ✓");
} finally {
  Date.now = realDateNow;
  delete global.localStorage;
}
