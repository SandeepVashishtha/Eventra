import assert from "node:assert/strict";
import { lazyWithRetry } from "../src/utils/lazyWithRetry.js";

const LazyComponent = lazyWithRetry(
  () => Promise.reject(new Error("Failed to fetch dynamically imported module")),
  0,
  0,
);
assert.equal(typeof LazyComponent, "object");
assert.equal(typeof LazyComponent.$$typeof, "symbol");

console.log("lazyWithRetry tests passed ✓");
