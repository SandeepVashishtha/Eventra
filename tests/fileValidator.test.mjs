import assert from "node:assert/strict";
import { validateImageFile } from "../src/utils/fileValidator.js";

const res = validateImageFile({ name: "test.png", size: 100, type: "image/png" });
assert.equal(res.valid, true);

const res2 = validateImageFile({ name: "test.exe", size: 100, type: "application/octet-stream" });
assert.equal(res2.valid, false);

console.log("fileValidator tests passed ✓");
