import assert from "node:assert/strict";

const listeners = {};
global.document = {
  addEventListener(type, handler) {
    listeners[type] = handler;
  },
  removeEventListener(type, handler) {
    if (listeners[type] === handler) {
      delete listeners[type];
    }
  },
};

const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "development";
process.env.REACT_APP_CSP_REPORT_URI = "";

const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => {
  warnings.push(args);
};

Object.defineProperty(globalThis, "navigator", {
  value: { sendBeacon: () => true },
  configurable: true,
  writable: true,
});

const { initCspReporting, teardownCspReporting } = await import(
  "../src/utils/cspReporting.js"
);

initCspReporting();
assert.ok(
  typeof listeners.securitypolicyviolation === "function",
  "registers securitypolicyviolation listener"
);

initCspReporting();
assert.ok(
  typeof listeners.securitypolicyviolation === "function",
  "second init is idempotent"
);

listeners.securitypolicyviolation({
  documentURI: "https://eventra.test/",
  violatedDirective: "script-src 'self'",
  effectiveDirective: "script-src",
  originalPolicy: "script-src 'self'",
  blockedURI: "https://evil.example/script.js",
  sourceFile: "app.js",
  lineNumber: 12,
  columnNumber: 4,
  statusCode: 200,
});

assert.ok(warnings.length > 0, "logs CSP violations in development");
assert.match(String(warnings[0][0]), /CSP Violation/);

teardownCspReporting();
assert.equal(
  listeners.securitypolicyviolation,
  undefined,
  "teardown removes the listener"
);

teardownCspReporting();
assert.equal(
  listeners.securitypolicyviolation,
  undefined,
  "second teardown is safe"
);

console.warn = originalWarn;
process.env.NODE_ENV = originalEnv;

console.log("cspReporting tests passed ✓");
