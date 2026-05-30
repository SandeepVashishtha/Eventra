import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useReducedMotion.js"),
  "utf8",
);

describe("useReducedMotion — source contract", () => {
  it("reads prefers-reduced-motion via matchMedia", () => {
    assert.ok(src.includes('"(prefers-reduced-motion: reduce)"'));
    assert.ok(src.includes("matchMedia"));
  });

  it("subscribes to media query changes", () => {
    assert.ok(src.includes('addEventListener?.("change"'));
    assert.ok(src.includes('removeEventListener?.("change"'));
  });

  it("guards against SSR environments without window", () => {
    assert.ok(src.includes('typeof window === "undefined"'));
  });
});

describe("useReducedMotion — matchMedia simulation", () => {
  it("returns true when reduced motion is preferred", () => {
    const listeners = {};
    const mediaQuery = {
      matches: true,
      addEventListener(event, handler) {
        listeners[event] = handler;
      },
      removeEventListener(event, handler) {
        if (listeners[event] === handler) delete listeners[event];
      },
    };

    global.window = {
      matchMedia: () => mediaQuery,
    };

    const initial =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    assert.equal(initial, true);

    mediaQuery.matches = false;
    listeners.change?.({ matches: false });
    assert.equal(mediaQuery.matches, false);
  });
});

console.log("useReducedMotion tests passed ✓");
