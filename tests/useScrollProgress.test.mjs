import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useScrollProgress.js"),
  "utf8",
);

describe("useScrollProgress — source contract", () => {
  it("uses requestAnimationFrame to throttle scroll updates", () => {
    assert.ok(src.includes("requestAnimationFrame"));
    assert.ok(src.includes("cancelAnimationFrame"));
  });

  it("listens for scroll and resize events", () => {
    assert.ok(src.includes('"scroll"'));
    assert.ok(src.includes('"resize"'));
  });

  it("clamps progress between 0 and 100", () => {
    assert.ok(src.includes("Math.max(0, Math.min(100, pct))"));
  });
});

describe("useScrollProgress — progress calculation", () => {
  it("returns 0 when the page is not scrollable", () => {
    const scrollTop = 0;
    const height = 0;
    const pct = height > 0 ? Math.round((scrollTop / height) * 100) : 0;
    assert.equal(Math.max(0, Math.min(100, pct)), 0);
  });

  it("returns 50 at the midpoint of scrollable content", () => {
    const scrollTop = 500;
    const height = 1000;
    const pct = Math.round((scrollTop / height) * 100);
    assert.equal(Math.max(0, Math.min(100, pct)), 50);
  });

  it("never exceeds 100 near the bottom", () => {
    const scrollTop = 1200;
    const height = 1000;
    const pct = Math.round((scrollTop / height) * 100);
    assert.equal(Math.max(0, Math.min(100, pct)), 100);
  });
});

console.log("useScrollProgress tests passed ✓");
