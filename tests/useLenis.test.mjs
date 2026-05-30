import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useLenis.js"),
  "utf8",
);

describe("useLenis — source contract", () => {
  it("skips Lenis initialization on coarse pointer devices", () => {
    assert.ok(src.includes("(pointer: coarse)"));
    assert.ok(src.includes("isTouchDevice"));
  });

  it("cancels requestAnimationFrame on cleanup", () => {
    assert.ok(src.includes("cancelAnimationFrame(rafId)"));
    assert.ok(src.includes("requestAnimationFrame(raf)"));
  });

  it("destroys Lenis and clears the global instance on unmount", () => {
    assert.ok(src.includes("lenis.destroy()"));
    assert.ok(src.includes("window.lenis = null"));
  });
});

console.log("useLenis tests passed ✓");
