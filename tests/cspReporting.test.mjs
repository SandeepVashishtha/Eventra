import assert from "node:assert/strict";

// Save original environment
const originalNodeEnv = process.env.NODE_ENV;
const originalReportUri = process.env.REACT_APP_CSP_REPORT_URI;

// Set environment variables for testing
process.env.NODE_ENV = "development";
process.env.REACT_APP_CSP_REPORT_URI = "https://example.com/csp-report";

// Mock document
const listeners = {};
global.document = {
  addEventListener(event, handler) {
    listeners[event] = handler;
  },
  removeEventListener(event, handler) {
    if (listeners[event] === handler) {
      delete listeners[event];
    }
  }
};

// Mock console.warn to capture dev logs
let loggedWarning = null;
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  loggedWarning = args;
};

// Mock Blob
class MockBlob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
}
global.Blob = MockBlob;

// ✅ FIX: Safe navigator mock for Node 22
let beaconSent = null;

Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: {
    sendBeacon(url, blob) {
      beaconSent = { url, blob };
      return true;
    }
  }
});

// Import module after mocks + env setup
const { initCspReporting, teardownCspReporting } = await import(
  "../src/utils/cspReporting.js"
);

// Test 1: initCspReporting registers event listener
assert.equal(
  listeners["securitypolicyviolation"],
  undefined,
  "no listener before init"
);

initCspReporting();

assert.ok(
  typeof listeners["securitypolicyviolation"] === "function",
  "listener registered after init"
);

// Test 2: triggering the listener in development
const mockCspEvent = {
  documentURI: "http://localhost/test",
  violatedDirective: "style-src",
  effectiveDirective: "style-src-elem",
  originalPolicy: "default-src 'none'",
  blockedURI: "inline",
  sourceFile: "main.js",
  lineNumber: 10,
  columnNumber: 5,
  statusCode: 200
};

listeners["securitypolicyviolation"](mockCspEvent);

// Verify dev warning was logged
assert.ok(loggedWarning !== null, "console.warn was called in dev environment");
assert.equal(loggedWarning[0], "[CSP Violation]");
assert.equal(loggedWarning[1], "Directive: style-src-elem");

// Verify beacon was dispatched
assert.ok(beaconSent !== null, "sendBeacon was called");
assert.equal(beaconSent.url, "https://example.com/csp-report");
assert.ok(beaconSent.blob instanceof MockBlob);

const parsedReport = JSON.parse(beaconSent.blob.content[0]);

assert.deepEqual(parsedReport["csp-report"], {
  "document-uri": "http://localhost/test",
  "violated-directive": "style-src",
  "effective-directive": "style-src-elem",
  "original-policy": "default-src 'none'",
  "blocked-uri": "inline",
  "source-file": "main.js",
  "line-number": 10,
  "column-number": 5,
  "status-code": 200
});

// Test 3: teardownCspReporting removes listener
teardownCspReporting();

assert.equal(listeners["securitypolicyviolation"], undefined);

// Restore originals
process.env.NODE_ENV = originalNodeEnv;

if (originalReportUri === undefined) {
  delete process.env.REACT_APP_CSP_REPORT_URI;
} else {
  process.env.REACT_APP_CSP_REPORT_URI = originalReportUri;
}

console.warn = originalConsoleWarn;

delete global.document;
delete globalThis.navigator;
delete global.Blob;

console.log("cspReporting tests passed ✓");