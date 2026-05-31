import assert from "node:assert/strict";

// Mock browser globals before importing
global.localStorage = {
  data: {},
  getItem(key) { return this.data[key] ?? null; },
  setItem(key, value) { this.data[key] = value; },
  removeItem(key) { delete this.data[key]; },
};
global.console = { ...console, group: () => {}, groupEnd: () => {}, warn: () => {}, info: () => {} };
global.window = { location: { href: "" }, dispatchEvent: () => {} };
global.navigator = { userAgent: "test-agent" };
global.CustomEvent = class CustomEvent {
  constructor(type, detail) { this.type = type; this.detail = detail; }
};

// Override process.env before importing
const originalEnv = process.env;
process.env = { ...originalEnv, NODE_ENV: "test", REACT_APP_SENTRY_DSN: "" };

const { logError, getErrorLog, clearErrorLog } = await import("../src/utils/errorLogger.js");

// Reset localStorage before each test
global.localStorage.data = {};
clearErrorLog();

// ── logError tests ───────────────────────────────────────────────────────────

{
  global.localStorage.data = {};
  clearErrorLog();
  logError(new Error("Test error"), { componentStack: "test" }, { extra: "data" });
  const logs = getErrorLog();
  assert.equal(logs.length, 1, "should have 1 error log entry");
  assert.equal(logs[0].message, "Error: Test error");
  assert.equal(logs[0].extra, "data");
  assert.ok(logs[0].timestamp, "should have timestamp");
}

{
  global.localStorage.data = {};
  clearErrorLog();
  logError(null, null, {});
  const logs = getErrorLog();
  assert.equal(logs.length, 1, "should have 1 error log entry for null error");
  assert.equal(logs[0].message, "Unknown error", "null error should produce Unknown error message");
}

{
  global.localStorage.data = {};
  clearErrorLog();
  const errorWithStack = new Error("With stack");
  logError(errorWithStack, {});
  const logs = getErrorLog();
  assert.equal(logs.length, 1, "should have 1 error log entry");
  assert.ok(logs[0].stack, "should have stack trace");
  assert.ok(logs[0].timestamp, "should have timestamp");
  assert.ok(logs[0].url === "", "should have empty url in non-browser env");
}

// ── getErrorLog tests ─────────────────────────────────────────────────────────

{
  global.localStorage.data = {};
  clearErrorLog();
  logError(new Error("Test1"), {});
  const logs = getErrorLog();
  assert.equal(Array.isArray(logs), true, "should return array");
  assert.equal(logs.length, 1, "should have 1 entry");
}

{
  global.localStorage.data = {};
  clearErrorLog();
  const logs = getErrorLog();
  assert.deepEqual(logs, [], "should return empty array when no logs");
}

{
  global.localStorage.data["eventra_error_log"] = "not valid json";
  const logs = getErrorLog();
  assert.deepEqual(logs, [], "should return empty array on parse error");
}

// ── clearErrorLog tests ───────────────────────────────────────────────────────

{
  global.localStorage.data = {};
  clearErrorLog();
  logError(new Error("After clear"), {});
  clearErrorLog();
  const logs = getErrorLog();
  assert.equal(logs.length, 0, "should have no logs after clear");
  assert.equal(global.localStorage.data["eventra_error_log"], undefined, "should remove from localStorage");
}

{
  global.localStorage.data = {};
  clearErrorLog();
  logError(new Error("One"), {});
  logError(new Error("Two"), {});
  const logs = getErrorLog();
  assert.equal(logs.length, 2, "should have 2 entries");
  clearErrorLog();
  const cleared = getErrorLog();
  assert.equal(cleared.length, 0, "should be empty after clear");
}

// Restore env
process.env = originalEnv;

console.log("All errorLogger tests passed!");
