import assert from "node:assert/strict";
import { logError, getErrorLog, clearErrorLog } from "../src/utils/errorLogger.js";

const store = {};
globalThis.localStorage = {
  getItem(key) { return store[key] || null; },
  setItem(key, value) { store[key] = String(value); },
  removeItem(key) { delete store[key]; }
};

const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;
console.error = () => {};
console.warn = () => {};
console.info = () => {};

logError(new Error("Test error"), { componentStack: "TestComponent" });
const errors = getErrorLog();
assert.equal(errors.length, 1);
assert.ok(errors[0].message.includes("Test error"));

clearErrorLog();
assert.equal(getErrorLog().length, 0);

console.error = originalError;
console.warn = originalWarn;
console.info = originalInfo;

console.log("errorLogger edge tests passed ✓");
