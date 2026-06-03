import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.resolve(__dirname, "../src/validation.js"), "utf8");

assert.match(
  src,
  /password:\s*\(val\)\s*=>\s*\n?\s*\(val && val\.length >= 8\)/,
  "validate.password must guard null/undefined before reading length",
);

console.log("validate.password sync guard tests passed ✓");
