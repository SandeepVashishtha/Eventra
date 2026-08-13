import assert from "node:assert/strict";

globalThis.window = {};
globalThis.process = { env: { NODE_ENV: "production" } };

import { initializeGlobalErrorHandling } from "../src/utils/globalErrorHandler.js";

initializeGlobalErrorHandling();

assert.ok(typeof window.onerror === "function");
assert.ok(typeof window.onunhandledrejection === "function");

console.log("globalErrorHandler tests passed ✓");
