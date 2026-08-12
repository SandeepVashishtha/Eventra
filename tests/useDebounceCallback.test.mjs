import assert from "node:assert/strict";
import useDebounceCallback from "../src/hooks/useDebounceCallback.js";

assert.strictEqual(typeof useDebounceCallback, "function");
console.log("useDebounceCallback tests loaded ✓");
