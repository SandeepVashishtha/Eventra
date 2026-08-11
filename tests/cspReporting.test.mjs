import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  resetCspReportingState,
} from "../src/utils/cspReporting.js";
import {
  isValidCspReport,
  isSelfOriginatingCspReport,
} from "../src/utils/cspReportValidator.js";

describe("CSP Report Collector Recursion & Rate Limit Tests", () => {
  beforeEach(() => {
    resetCspReportingState();
  });

  it("should rate-limit reports to maximum 3 reports per 10-second window", () => {
    assert.equal(checkRateLimit(), true, "Report 1 should pass");
    assert.equal(checkRateLimit(), true, "Report 2 should pass");
    assert.equal(checkRateLimit(), true, "Report 3 should pass");
    assert.equal(checkRateLimit(), false, "Report 4 should be throttled by sliding window");
  });

  it("should identify self-originating CSP violation report endpoints", () => {
    const reportUri = "https://csp-report.example.com/collector";
    const selfBlocked = "https://csp-report.example.com/collector/script.js";
    const externalBlocked = "https://malicious-cdn.com/asset.js";

    assert.equal(isSelfOriginatingCspReport(selfBlocked, reportUri), true);
    assert.equal(isSelfOriginatingCspReport(externalBlocked, reportUri), false);
  });

  it("should validate CSP report object structure", () => {
    const validReport = {
      "csp-report": {
        "document-uri": "https://eventra.io/dashboard",
        "violated-directive": "script-src",
        "effective-directive": "script-src-elem",
      },
    };
    assert.equal(isValidCspReport(validReport), true);
    assert.equal(isValidCspReport(null), false);
  });
});
