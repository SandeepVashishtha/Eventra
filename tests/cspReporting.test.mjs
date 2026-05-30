import assert from "node:assert/strict";

// Mock environment and browser globals
const originalNodeEnv = process.env.NODE_ENV;
const originalReportUri = process.env.REACT_APP_CSP_REPORT_URI;

process.env.NODE_ENV = 'development';
process.env.REACT_APP_CSP_REPORT_URI = 'https://api.example.com/csp-report';

const listeners = {};
global.document = {
  addEventListener: (event, handler) => {
    listeners[event] = handler;
  },
  removeEventListener: (event, handler) => {
    if (listeners[event] === handler) {
      delete listeners[event];
    }
  }
};

let lastBeaconUri = null;
let lastBeaconBlob = null;
global.Blob = class {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
  }
};
global.navigator = {
  sendBeacon: (uri, blob) => {
    lastBeaconUri = uri;
    lastBeaconBlob = blob;
    return true;
  }
};

let lastFetchUri = null;
let lastFetchOptions = null;
global.fetch = async (uri, options) => {
  lastFetchUri = uri;
  lastFetchOptions = options;
  return { ok: true };
};

// Import after globals are mocked
const { initCspReporting, teardownCspReporting } = await import("../src/utils/cspReporting.js");

try {
  // Test Case 1: initCspReporting attaches the listener
  initCspReporting();
  assert(listeners['securitypolicyviolation'] !== undefined, "Should register securitypolicyviolation listener");

  // Test Case 2: Triggering the event sends the beacon report
  const mockEvent = {
    documentURI: "https://example.com/home",
    violatedDirective: "style-src-elem",
    effectiveDirective: "style-src-elem",
    originalPolicy: "default-src 'self'",
    blockedURI: "inline",
    sourceFile: "main.js",
    lineNumber: 42,
    columnNumber: 10,
    statusCode: 200
  };

  // Mock console.warn to verify dev logging
  const originalConsoleWarn = console.warn;
  let loggedCsp = false;
  console.warn = (...args) => {
    if (args[0] === '[CSP Violation]') loggedCsp = true;
  };

  try {
    listeners['securitypolicyviolation'](mockEvent);
  } finally {
    console.warn = originalConsoleWarn;
  }

  assert(loggedCsp, "Should log violation in development mode");
  assert.equal(lastBeaconUri, 'https://api.example.com/csp-report', "Should send report to REACT_APP_CSP_REPORT_URI");
  
  const parsedBlobData = JSON.parse(lastBeaconBlob.parts[0]);
  assert.equal(parsedBlobData['csp-report']['document-uri'], mockEvent.documentURI);
  assert.equal(parsedBlobData['csp-report']['violated-directive'], mockEvent.violatedDirective);
  assert.equal(parsedBlobData['csp-report']['blocked-uri'], mockEvent.blockedURI);

  // Test Case 3: Teardown removes the event listener
  teardownCspReporting();
  assert(listeners['securitypolicyviolation'] === undefined, "Should remove securitypolicyviolation listener on teardown");

  // Test Case 4: Beacon fallback to fetch when Beacon fails (throws error)
  initCspReporting();
  global.navigator.sendBeacon = () => {
    throw new Error("Beacon blocked");
  };

  listeners['securitypolicyviolation'](mockEvent);
  assert.equal(lastFetchUri, 'https://api.example.com/csp-report', "Should fallback to fetch on Beacon failure");
  assert.equal(lastFetchOptions.method, 'POST');
  assert.equal(lastFetchOptions.headers['Content-Type'], 'application/csp-report');
  
  const parsedFetchData = JSON.parse(lastFetchOptions.body);
  assert.equal(parsedFetchData['csp-report']['document-uri'], mockEvent.documentURI);

  teardownCspReporting();

  console.log("cspReporting tests passed ✓");
} finally {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.REACT_APP_CSP_REPORT_URI = originalReportUri;
  delete global.document;
  delete global.navigator;
  delete global.Blob;
  delete global.fetch;
}
