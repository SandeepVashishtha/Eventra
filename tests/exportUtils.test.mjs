import assert from "node:assert/strict";
import { sanitizeFilename } from "../src/utils/exportUtils.js";

assert.equal(sanitizeFilename("GSSoC Eventra Report!"), "gssoc_eventra_report_");

console.log("exportUtils tests passed ✓");
