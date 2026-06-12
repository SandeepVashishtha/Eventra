import assert from "node:assert/strict";
import { isValidCspReport } from "../src/utils/cspReportValidator.js";

assert.equal(isValidCspReport(null), false);
assert.equal(isValidCspReport({ "csp-report": { "violated-directive": "script-src", "blocked-uri": "javascript:alert(1)" } }), false, "Should reject malicious scripts");
assert.equal(isValidCspReport({ "csp-report": { "violated-directive": "script-src", "blocked-uri": "https://example.com/script.js" } }), true, "Should accept valid report");
console.log("cspReportValidator sanitization tests passed ✓");
