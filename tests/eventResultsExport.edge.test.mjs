import assert from "node:assert/strict";
import { getExportDateStamp, getEventExportFilename } from "../src/utils/eventResultsExport.js";

const date = new Date("2026-06-01T00:00:00Z");
assert.equal(getExportDateStamp(date), "2026-06-01");
assert.equal(getEventExportFilename("json", date), "events-export-2026-06-01.json");
console.log("eventResultsExport edge tests passed ✓");
