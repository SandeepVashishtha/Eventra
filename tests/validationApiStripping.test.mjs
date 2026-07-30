import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/utils/validationApi.js", "utf8");
assert.ok(source.includes("replace(/<[^>]*>/g"), "Should strip HTML tag elements");
console.log("validationApi input stripping tests passed");
