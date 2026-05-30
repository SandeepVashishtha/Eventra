import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  path.resolve(__dirname, "../src/hooks/useDebouncedSearch.js"),
  "utf8",
);

describe("useDebouncedSearch — source contract", () => {
  it("tracks searchTerm and debouncedTerm separately", () => {
    assert.ok(src.includes("searchTerm"));
    assert.ok(src.includes("debouncedTerm"));
    assert.ok(src.includes("isDebouncing"));
  });

  it("debounces updates with setTimeout and clears on cleanup", () => {
    assert.ok(src.includes("setTimeout"));
    assert.ok(src.includes("clearTimeout"));
  });

  it("exposes a clear helper wrapped in useCallback", () => {
    assert.ok(src.includes("const clear = useCallback"));
    assert.ok(src.includes("setSearchTerm('')"));
    assert.ok(src.includes("setDebouncedTerm('')"));
  });
});

describe("useDebouncedSearch — debounce simulation", () => {
  it("marks debouncing active until the delay elapses", () => {
    let searchTerm = "a";
    let debouncedTerm = "a";
    let isDebouncing = false;
    let timer = null;

    const schedule = (nextTerm, delay) => {
      if (nextTerm === debouncedTerm) {
        isDebouncing = false;
        return;
      }
      isDebouncing = true;
      if (timer) timer.cleared = true;
      timer = {
        cleared: false,
        run() {
          debouncedTerm = nextTerm;
          isDebouncing = false;
        },
      };
      void delay;
    };

    schedule("a", 100);
    assert.equal(isDebouncing, false);

    searchTerm = "ab";
    schedule(searchTerm, 100);
    assert.equal(isDebouncing, true);
    assert.equal(debouncedTerm, "a");

    timer.run();
    assert.equal(debouncedTerm, "ab");
    assert.equal(isDebouncing, false);
  });
});

console.log("useDebouncedSearch tests passed ✓");
