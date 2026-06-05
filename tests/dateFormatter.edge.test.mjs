import assert from "node:assert/strict";
import { formatEventDate } from "../src/utils/dateFormatter.js";

assert.equal(formatEventDate("invalid"), "Invalid date");
console.log("dateFormatter edge tests passed ✓");
