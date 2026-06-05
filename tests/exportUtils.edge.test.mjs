import assert from "node:assert/strict";
import { sanitizeFilename } from "../src/utils/exportUtils.js";

assert.equal(sanitizeFilename("My File Name!"), "my_file_name_");
console.log("exportUtils edge tests passed ✓");
