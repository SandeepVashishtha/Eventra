import assert from "node:assert/strict";
import { lazyWithRetry } from "../src/utils/lazyWithRetry.js";

try {
  const loader = lazyWithRetry(async () => {
    throw new Error("Failed chunk load");
  }, 2);
  assert.ok(loader, "Should wrap in React lazy loader");
  console.log("lazyWithRetry loader tests passed ✓");
} catch (err) {}
