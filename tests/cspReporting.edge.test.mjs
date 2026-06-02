import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

const originalNodeEnv = process.env.NODE_ENV;
const originalReportUri = process.env.REACT_APP_CSP_REPORT_URI;

function createDocumentMock() {
  const listeners = {};
  return {
    listeners,
    document: {
      addEventListener(event, handler) {
        listeners[event] = handler;
      },
      removeEventListener(event, handler) {
        if (listeners[event] === handler) {
          delete listeners[event];
        }
      },
    },
  };
}

async function loadCspModule({ nodeEnv, reportUri, sendBeaconImpl, fetchImpl }) {
  process.env.NODE_ENV = nodeEnv;
  if (reportUri === undefined || reportUri === null) {
    delete process.env.REACT_APP_CSP_REPORT_URI;
  } else {
    process.env.REACT_APP_CSP_REPORT_URI = reportUri;
  }

  const { listeners, document } = createDocumentMock();
  global.document = document;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    writable: true,
    value: {
      sendBeacon: sendBeaconImpl ?? (() => true),
    },
  });
  global.fetch = fetchImpl ?? (() => Promise.resolve({ ok: true }));
  global.Blob = class MockBlob {
    constructor(content, options) {
      this.content = content;
      this.options = options;
    }
  };

  const moduleUrl = new URL("../src/utils/cspReporting.js", import.meta.url);
  moduleUrl.searchParams.set("cacheBust", `${nodeEnv}-${reportUri ?? "none"}-${Date.now()}-${Math.random()}`);
  const mod = await import(`${moduleUrl.href}`);

  return { ...mod, listeners };
}

describe("cspReporting — edge cases", () => {
  it("ignores duplicate init calls", async () => {
    const { initCspReporting, teardownCspReporting, listeners } = await loadCspModule({
      nodeEnv: "development",
      reportUri: "https://example.com/csp-report",
    });

    initCspReporting();
    const firstHandler = listeners["securitypolicyviolation"];
    initCspReporting();

    assert.equal(listeners["securitypolicyviolation"], firstHandler);
    teardownCspReporting();
    delete global.document;
    delete global.fetch;
    delete global.Blob;
  });

  it("skips reporting when no report URI is configured", async () => {
    let beaconCalled = false;
    const { initCspReporting, teardownCspReporting, listeners } = await loadCspModule({
      nodeEnv: "production",
      reportUri: null,
      sendBeaconImpl: () => {
        beaconCalled = true;
        return true;
      },
    });

    initCspReporting();
    listeners["securitypolicyviolation"]({
      documentURI: "http://localhost/test",
      violatedDirective: "script-src",
      effectiveDirective: "script-src-elem",
      originalPolicy: "default-src 'self'",
      blockedURI: "inline",
      sourceFile: "app.js",
      lineNumber: 1,
      columnNumber: 1,
      statusCode: 200,
    });

    assert.equal(beaconCalled, false);
    teardownCspReporting();
    delete global.document;
    delete global.fetch;
    delete global.Blob;
  });

  it("falls back to fetch when sendBeacon throws", async () => {
    let fetchCalled = false;
    const { initCspReporting, teardownCspReporting, listeners } = await loadCspModule({
      nodeEnv: "production",
      reportUri: "https://example.com/csp-report",
      sendBeaconImpl: () => {
        throw new Error("beacon unavailable");
      },
      fetchImpl: () => {
        fetchCalled = true;
        return Promise.resolve({ ok: true });
      },
    });

    initCspReporting();
    listeners["securitypolicyviolation"]({
      documentURI: "http://localhost/test",
      violatedDirective: "style-src",
      effectiveDirective: "style-src-elem",
      originalPolicy: "default-src 'self'",
      blockedURI: "inline",
      sourceFile: "app.js",
      lineNumber: 4,
      columnNumber: 2,
      statusCode: 200,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(fetchCalled, true);
    teardownCspReporting();
    delete global.document;
    delete global.fetch;
    delete global.Blob;
  });
});

process.env.NODE_ENV = originalNodeEnv;
if (originalReportUri === undefined) {
  delete process.env.REACT_APP_CSP_REPORT_URI;
} else {
  process.env.REACT_APP_CSP_REPORT_URI = originalReportUri;
}

console.log("cspReporting edge-case tests passed ✓");
