import assert from "node:assert/strict";
import { lazyWithRetry } from "../src/utils/lazyWithRetry.js";

try {
  const mockImport = async () => ({ default: "Component" });
  const LazyComp = lazyWithRetry(mockImport);
  assert.ok(LazyComp);

  console.log("lazyWithRetry tests passed ✓");
} catch (e) {
  console.error(e);
  process.exit(1);
}
