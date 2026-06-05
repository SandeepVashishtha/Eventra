import assert from "node:assert/strict";
import { getOptimizedImageUrl } from "../src/utils/imageOptimizer.js";

const url = getOptimizedImageUrl("https://example.com/image.jpg", { width: 500 });
assert.ok(url.includes("w_500"));
assert.ok(url.includes("image.jpg"));
console.log("imageOptimizer tests passed ✓");
