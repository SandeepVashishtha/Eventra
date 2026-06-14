/**
 * @fileoverview errorLogger.test.mjs
 *
 * Comprehensive test suite validating error logging, error queue persistence,
 * and graceful fallback mechanisms when browser APIs (such as localStorage)
 * are unavailable or corrupted.
 */

import assert from "node:assert/strict";

// Mock localStorage store
let store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  }
};

// Mock window location and dispatchEvent
globalThis.window = {
  location: { href: "http://localhost/test" },
  dispatchEvent: () => {},
};

// Import errorLogger functions after global mocks are registered
import { 
  logError, 
  getErrorLog, 
  clearErrorLog,
  persistErrors,
  getErrors,
  clearErrors
} from "../src/utils/errorLogger.js";

// Reset store mock state before each test group
function resetStore() {
  store = {};
}

// ---------------------------------------------------------------------------
// 1. General logError and Queue Capping Tests
// ---------------------------------------------------------------------------
console.log("Running Group 1: General Error Logging & Queue Limits...");
resetStore();

const testError = new Error("Test error");
const testInfo = { componentStack: "Test component" };

logError(testError, testInfo);
let log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 1, "Should add error entry to log");
assert.ok(log[0].message.includes("Test error"), "Should store error message");
assert.strictEqual(log[0].componentStack, "Test component", "Should store component stack");

// Log 9 more errors to reach exactly the capacity limit of 10 items
for (let i = 1; i <= 9; i++) {
  logError(new Error(`Incremental error ${i}`), {});
}

log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 10, "Should have exactly 10 entries");
assert.ok(log[0].message.includes("Incremental error 9"), "Newest entry should be first");
assert.ok(log[9].message.includes("Test error"), "First logged error should be the oldest at index 9");

// Log the 11th error -> this should evict the oldest error (testError)
logError(new Error("Eleventh error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 10, "Should cap at 10 entries");
assert.ok(log[0].message.includes("Eleventh error"), "Eleventh error should now be first");
assert.ok(log[9].message.includes("Incremental error 1"), "Incremental error 1 should now be the oldest at index 9");

// Test getErrorLog utility
const entries = getErrorLog();
assert.strictEqual(Array.isArray(entries), true, "getErrorLog should return array");
assert.strictEqual(entries.length, 10, "getErrorLog should return 10 entries");

// Test clearErrorLog utility
clearErrorLog();
assert.strictEqual(store["eventra_error_log"], undefined, "Should clear error log from localStorage");

// ---------------------------------------------------------------------------
// 2. Corrupt JSON and Empty LocalStorage Handling
// ---------------------------------------------------------------------------
console.log("Running Group 2: Corruption and Parsing Edge Cases...");
resetStore();

store["eventra_error_log"] = "invalid-json-data";
const emptyLog = getErrorLog();
assert.strictEqual(Array.isArray(emptyLog), true, "Should return array even on corrupt JSON");
assert.strictEqual(emptyLog.length, 0, "Should return empty array on corrupt JSON");

store["eventra_error_log"] = JSON.stringify([{ message: "Error: Test entry" }]);
const singleEntry = getErrorLog();
assert.strictEqual(singleEntry.length, 1, "Should read single entry");
assert.ok(singleEntry[0].message.includes("Test entry"), "Should return correct entry");

// ---------------------------------------------------------------------------
// 3. Feature-Specific Error Persistence (persistErrors)
// ---------------------------------------------------------------------------
console.log("Running Group 3: Feature-Specific Persistence...");
resetStore();

const featureKey = "auth_session";
const featureError = { message: "Failed to authenticate session token", code: 401 };

persistErrors(featureKey, featureError, 5);
let featureLogs = getErrors(featureKey);
assert.strictEqual(featureLogs.length, 1, "Should persist feature-specific error");
assert.strictEqual(featureLogs[0].code, 401, "Should preserve custom fields");

// Verify capping for custom error queues
for (let i = 1; i <= 7; i++) {
  persistErrors(featureKey, { message: `Feature error ${i}` }, 5);
}
featureLogs = getErrors(featureKey);
assert.strictEqual(featureLogs.length, 5, "Custom queue should be capped at 5");
assert.ok(featureLogs[0].message.includes("Feature error 7"), "Newest feature error should be first");

// Test clearing custom error logs
clearErrors(featureKey);
assert.strictEqual(getErrors(featureKey).length, 0, "Custom queue should be cleared successfully");

// ---------------------------------------------------------------------------
// 4. Storage Quota Exceeded and Disable Mocks
// ---------------------------------------------------------------------------
console.log("Running Group 4: LocalStorage Security & Quota Failures...");
resetStore();

// Mock localStorage throwing security exception or quota exceeded error
globalThis.localStorage.setItem = () => {
  throw new Error("QuotaExceededError: The user agent has exceeded its storage quota.");
};

// Should not crash the main application thread when calling logError or persistErrors
assert.doesNotThrow(() => {
  logError(new Error("Crash prevention test"), {});
}, "logError should catch internally and not propagate localStorage errors");

assert.doesNotThrow(() => {
  persistErrors("payment", { message: "Checkout failed" }, 5);
}, "persistErrors should catch internally and not propagate localStorage errors");

// Restore original mock implementation
globalThis.localStorage.setItem = (key, val) => {
  store[key] = String(val);
};

console.log("All errorLogger tests passed successfully! ✓");