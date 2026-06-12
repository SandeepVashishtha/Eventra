import assert from "node:assert";
import { isValidCspReport } from "../src/utils/cspReportValidator.js";

const validReport = {
  "csp-report": {
    "violated-directive": "script-src",
  },
};

const invalidReport = {};

assert.equal(
  isValidCspReport(validReport),
  true
);

assert.equal(
  isValidCspReport(invalidReport),
  false
);

console.log("cspReportValidator tests passed");