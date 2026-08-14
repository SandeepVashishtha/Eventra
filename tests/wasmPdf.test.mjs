import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getWasmPdfWorkerSource } from "../src/utils/pdf/wasmPdfWorker.js";

describe("WASM PDF Compilation Worker Template Tests", () => {
  it("should output valid verifier source containing standard bytes matches", () => {
    const code = getWasmPdfWorkerSource();
    assert.ok(code.includes("self.onmessage"));
    assert.ok(code.includes("0x25, 0x50, 0x44, 0x46")); // %PDF check
  });
});
