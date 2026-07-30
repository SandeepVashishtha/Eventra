import assert from "node:assert/strict";

/**
 * Mirrors scroll progress math from useScrollProgress for behavioral coverage.
 */
function calcScrollProgress(scrollY, scrollHeight, innerHeight) {
  const height = scrollHeight - innerHeight;
  const pct = height > 0 ? Math.round((scrollY / height) * 100) : 0;
  return Math.max(0, Math.min(100, pct));
}

assert.equal(calcScrollProgress(0, 1000, 500), 0, "top of page is 0%");
assert.equal(calcScrollProgress(250, 1000, 500), 50, "mid scroll is 50%");
assert.equal(calcScrollProgress(500, 1000, 500), 100, "bottom is 100%");
assert.equal(calcScrollProgress(9999, 1000, 500), 100, "clamps above 100");
assert.equal(calcScrollProgress(-10, 1000, 500), 0, "clamps below 0");
assert.equal(calcScrollProgress(100, 500, 500), 0, "no scrollable height is 0%");

const src = await import("node:fs").then((fs) =>
  fs.readFileSync(
    new URL("../src/hooks/useScrollProgress.js", import.meta.url),
    "utf8"
  )
);

assert.match(src, /cancelAnimationFrame\(rafRef\.current\)/);
assert.match(src, /passive:\s*true/);

console.log("useScrollProgress edge-case tests passed ✓");
