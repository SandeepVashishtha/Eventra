import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resetCanvasMemory, generateBlobUrlFromCanvas } from "../src/components/hackathons/collaboration/canvasExportUtils.js";

describe("Canvas Context 2D Buffer Export Tests", () => {
  it("should reset canvas dimensions to zero to release memory context", () => {
    const canvas = { width: 1920, height: 1080 };
    resetCanvasMemory(canvas);

    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
  });

  it("should generate a simulated blob URL in test environments", async () => {
    const canvas = {}; // Plain object to test fallback branch
    const url = await generateBlobUrlFromCanvas(canvas);

    assert.ok(url.startsWith("blob:"));
  });
});
