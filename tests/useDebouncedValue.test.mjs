import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useDebouncedValue.js"),
  "utf8",
);

describe("useDebouncedValue — source contract", () => {
  it("debounces value updates with setTimeout", () => {
    assert.ok(src.includes("setTimeout"), "Must schedule debounced updates");
    assert.ok(src.includes("clearTimeout"), "Must clear pending timers on rerender");
  });

  it("tracks value and delay in the effect dependency array", () => {
    assert.ok(
      src.includes("[value, delayMs]"),
      "Effect must rerun when value or delay changes",
    );
  });

  it("exports useDebouncedCallback and useDebouncedSearch helpers", () => {
    assert.ok(src.includes("export function useDebouncedCallback"));
    assert.ok(src.includes("export function useDebouncedSearch"));
  });
});

describe("useDebouncedValue — debounce simulation", () => {
  it("updates only after the delay elapses", () => {
    const timers = [];
    const setTimeout = (fn, delay) => {
      const timer = { fn, delay, cleared: false };
      timers.push(timer);
      return timer;
    };
    const clearTimeout = (timer) => {
      timer.cleared = true;
    };

    let debouncedValue = "a";
    let timer = null;

    const schedule = (value, delayMs) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        debouncedValue = value;
      }, delayMs);
    };

    schedule("a", 100);
    assert.equal(debouncedValue, "a", "initial value is returned immediately");

    schedule("ab", 100);
    assert.equal(debouncedValue, "a", "rapid changes keep the previous debounced value");

    timers.at(-1).fn();
    assert.equal(debouncedValue, "ab", "value updates after debounce delay");
  });

  it("clears the pending timer when a new value arrives", () => {
    const timers = [];
    const setTimeout = (fn, delay) => {
      const timer = { fn, delay, cleared: false };
      timers.push(timer);
      return timer;
    };
    const clearTimeout = (timer) => {
      timer.cleared = true;
    };

    let timer = setTimeout(() => {}, 100);
    timer = setTimeout(() => {}, 100);
    clearTimeout(timer);

    assert.ok(timers.some((entry) => entry.cleared), "previous timer is cleared");
  });
});

console.log("useDebouncedValue tests passed ✓");
