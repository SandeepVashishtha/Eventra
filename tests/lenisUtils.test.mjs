import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { notifyLenisResize, getImageAspectRatioStyle } from "../src/utils/lenisUtils.js";

describe("Lenis Scroll Virtualization & Aspect Ratio Tests", () => {
  it("should generate CSS aspect-ratio style bounding box", () => {
    const style = getImageAspectRatioStyle(16, 9);
    assert.equal(style.aspectRatio, "16 / 9");
    assert.equal(style.width, "100%");
  });

  it("should trigger debounced notifyLenisResize safely", async () => {
    let resizedCalled = false;
    globalThis.window = {
      lenis: {
        resize: () => {
          resizedCalled = true;
        },
      },
    };

    notifyLenisResize(10);
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(resizedCalled, true);
  });
});
