/**
 * Unit tests for src/utils/errorLogger.js and src/utils/globalErrorHandler.js
 *
 * Verifies that both utilities delegate correctly to console.error without
 * throwing side-effects, and that initializeGlobalErrorHandling registers
 * the expected window event handlers.
 */

import assert from "node:assert/strict";

// ── Stubs ──────────────────────────────────────────────────────────────────
const captured = [];

global.console = {
  error: (...args) => captured.push(args),
  warn: () => {},
  log: console.log,
};

// Minimal window stub for globalErrorHandler
global.window = {
  onerror: null,
  onunhandledrejection: null,
};

// ── Import modules ──────────────────────────────────────────────────────────
const { logError } = await import("../src/utils/errorLogger.js");
const { initializeGlobalErrorHandling } = await import(
  "../src/utils/globalErrorHandler.js"
);

// ── errorLogger: logError ──────────────────────────────────────────────────
captured.length = 0;

const err = new Error("Boom");
const info = { componentStack: "\n    at Foo\n    at Bar" };

logError(err, info);

assert.equal(
  captured.length,
  2,
  "logError calls console.error exactly twice (once per argument)"
);
assert.equal(
  captured[0][0],
  "Error:",
  "first call is tagged Error:"
);
assert.equal(
  captured[0][1],
  err,
  "first call passes the Error object through"
);
assert.equal(
  captured[1][0],
  "Component Stack:",
  "second call is tagged Component Stack:"
);
assert.equal(
  captured[1][1],
  info.componentStack,
  "second call passes the componentStack through"
);

// logError must not throw for null / undefined inputs
captured.length = 0;
assert.doesNotThrow(
  () => logError(null, undefined),
  "logError does not throw when passed null error"
);
assert.doesNotThrow(
  () => logError(undefined, null),
  "logError does not throw when passed undefined error"
);

// ── globalErrorHandler: initializeGlobalErrorHandling ─────────────────────
global.window.onerror = null;
global.window.onunhandledrejection = null;

initializeGlobalErrorHandling();

assert.equal(
  typeof global.window.onerror,
  "function",
  "initializeGlobalErrorHandling registers window.onerror"
);
assert.equal(
  typeof global.window.onunhandledrejection,
  "function",
  "initializeGlobalErrorHandling registers window.onunhandledrejection"
);

// Simulate a global error — handler must not throw
captured.length = 0;
global.window.onerror("msg", "src.js", 10, 5, new Error("global err"));
assert.ok(
  captured.some((args) => args[0] === "[GlobalError]"),
  "window.onerror logs with [GlobalError] tag"
);

// Simulate an unhandled rejection — handler must not throw
captured.length = 0;
const rejection = new Error("unhandled promise rejection");
global.window.onunhandledrejection({ reason: rejection });
assert.ok(
  captured.some((args) => args[0] === "[UnhandledPromiseRejection]"),
  "window.onunhandledrejection logs with [UnhandledPromiseRejection] tag"
);

// Calling initializeGlobalErrorHandling multiple times must be idempotent
assert.doesNotThrow(
  () => initializeGlobalErrorHandling(),
  "initializeGlobalErrorHandling can be called repeatedly without throwing"
);

console.log("All errorLogger & globalErrorHandler tests passed ✓");
