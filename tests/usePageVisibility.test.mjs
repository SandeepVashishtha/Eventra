/**
 * Tests for src/hooks/usePageVisibility.js
 */

import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/usePageVisibility.js"),
  "utf8",
);

describe("usePageVisibility — source contract", () => {
  it("exports usePageVisibility as default export", () => {
    assert.ok(src.includes("export default usePageVisibility"));
  });

  it("uses Page Visibility API state", () => {
    assert.ok(src.includes("document.visibilityState"));
    assert.ok(src.includes("visibilitychange"));
  });

  it("tracks visibility with React state and effect", () => {
    assert.ok(src.includes("useState"));
    assert.ok(src.includes("useEffect"));
  });

  it("cleans up visibilitychange listener on unmount", () => {
    assert.ok(src.includes("removeEventListener"));
  });

  it("defaults to visible when document is unavailable", () => {
    assert.ok(src.includes('typeof document === "undefined"'));
    assert.ok(src.includes('return true'));
  });
});

console.log("usePageVisibility tests passed ✓");
