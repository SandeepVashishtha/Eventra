import assert from "node:assert/strict";
import { supportsWebp } from "../src/utils/imageOptimizer.js";

// Mock document
globalThis.document = {
  createElement() {
    return {
      getContext() { return {}; },
      toDataURL() { return "data:image/webp;base64,..."; }
    };
  }
};

try {
  assert.equal(supportsWebp(), true, "Should detect webp canvas support");
  console.log("imageOptimizer WebP fallback tests passed ✓");
} finally {
  delete globalThis.document;
}
