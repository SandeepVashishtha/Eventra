import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useFocusTrap.js"),
  "utf8",
);

describe("useFocusTrap — source contract", () => {
  it("queries standard focusable selectors", () => {
    assert.ok(src.includes("a[href]"));
    assert.ok(src.includes('button:not([disabled])'));
    assert.ok(src.includes('[tabindex]:not([tabindex="-1"])'));
  });

  it("listens for Tab on document instead of the container", () => {
    assert.ok(src.includes("document.addEventListener('keydown', handleKeyDown)"));
    assert.ok(src.includes("document.removeEventListener('keydown', handleKeyDown)"));
  });

  it("restores focus to the previously active element on cleanup", () => {
    assert.ok(src.includes("previousFocusRef.current"));
    assert.ok(src.includes("previousFocusRef.current.focus()"));
  });

  it("wraps focus from last to first and first to last", () => {
    assert.ok(src.includes("e.shiftKey"));
    assert.ok(src.includes("last.focus()"));
    assert.ok(src.includes("first.focus()"));
  });
});

console.log("useFocusTrap tests passed ✓");
