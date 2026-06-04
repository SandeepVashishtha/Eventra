import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useLenis.js"),
  "utf8"
);

assert.match(src, /cancelAnimationFrame\(rafId\)/, "cancels RAF on unmount");
assert.match(src, /lenis\.destroy\(\)/, "destroys Lenis on cleanup");
assert.match(src, /window\.lenis = null/, "clears global Lenis reference");
assert.match(src, /\.\.\.options/, "merges caller options into Lenis config");
assert.match(
  src,
  /options = DEFAULT_LENIS_OPTIONS/,
  "uses a stable default options object"
);
assert.match(src, /pointer: coarse/, "skips Lenis on touch devices");

const defaultDuration = src.match(/duration:\s*([\d.]+)/);
assert.ok(defaultDuration, "defines default Lenis duration");
assert.equal(defaultDuration[1], "1.2");

console.log("useLenis edge-case tests passed ✓");
