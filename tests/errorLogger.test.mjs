import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

globalThis.window = {
  location: { href: "http://localhost/test" },
  dispatchEvent: () => {},
};

import { logError, getErrorLog, clearErrorLog } from "../src/utils/errorLogger.js";

const testError = new Error("Test error");
const testInfo = { componentStack: "Test component" };

store["eventra_error_log"] = undefined;
store["eventra_feature_errors"] = undefined;

logError(testError, testInfo);
let log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 1, "Should add error entry to log");
assert.ok(log[0].message.includes("Test error"), "Should store error message");
assert.strictEqual(log[0].componentStack, "Test component", "Should store component stack");

logError(new Error("Second error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 2, "Should have 2 entries after second log");

logError(new Error("Third error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 3, "Should have 3 entries");

logError(new Error("Fourth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 4, "Should have 4 entries");

logError(new Error("Fifth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 5, "Should have 5 entries");

logError(new Error("Sixth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 6, "Should have 6 entries");

logError(new Error("Seventh error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 7, "Should have 7 entries");

logError(new Error("Eighth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 8, "Should have 8 entries");

logError(new Error("Ninth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 9, "Should have 9 entries");

logError(new Error("Tenth error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 10, "Should have 10 entries");

logError(new Error("Eleventh error"), {});
log = JSON.parse(store["eventra_error_log"] || "[]");
assert.strictEqual(log.length, 10, "Should cap at 10 entries (oldest removed)");

assert.ok(log[0].message.includes("Eleventh error"), "Newest entry should be first");
assert.ok(log[9].message.includes("Second error"), "Oldest entry should be last");

const entries = getErrorLog();
assert.strictEqual(Array.isArray(entries), true, "getErrorLog should return array");
assert.strictEqual(entries.length, 10, "getErrorLog should return 10 entries");

clearErrorLog();
assert.strictEqual(store["eventra_error_log"], undefined, "Should clear error log from localStorage");
assert.strictEqual(store["eventra_feature_errors"], undefined, "Should clear feature errors from localStorage");

store["eventra_error_log"] = "invalid-json";
const emptyLog = getErrorLog();
assert.strictEqual(Array.isArray(emptyLog), true, "Should return array even on corrupt JSON");
assert.strictEqual(emptyLog.length, 0, "Should return empty array on corrupt JSON");

store["eventra_error_log"] = JSON.stringify([{ message: "Error: Test entry" }]);
const singleEntry = getErrorLog();
assert.strictEqual(singleEntry.length, 1, "Should read single entry");
assert.ok(singleEntry[0].message.includes("Test entry"), "Should return correct entry");

console.log("errorLogger tests passed ✓");