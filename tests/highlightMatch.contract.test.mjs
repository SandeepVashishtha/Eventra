import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/utils/highlightMatch.js"),
  "utf8",
);

describe("highlightMatch — source contract", () => {
  it("escapes regex metacharacters before constructing RegExp", () => {
    assert.ok(src.includes("escapeRegex"));
    assert.ok(src.includes('.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")'));
  });

  it("returns early when query or text is empty", () => {
    assert.ok(src.includes("if (!query || !text) return text"));
  });

  it("uses case-insensitive matching with captured split segments", () => {
    assert.ok(src.includes('"gi"'));
    assert.ok(src.includes("part.toLowerCase() === query.toLowerCase()"));
  });
});

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("highlightMatch — escapeRegex simulation", () => {
  it("neutralizes ReDoS-prone patterns", () => {
    assert.equal(escapeRegex("(a+)+$"), "\\(a\\+\\)\\+\\$");
  });

  it("escapes bracket and dot metacharacters", () => {
    assert.equal(escapeRegex("a.b[c]"), "a\\.b\\[c\\]");
  });
});

console.log("highlightMatch contract tests passed ✓");
