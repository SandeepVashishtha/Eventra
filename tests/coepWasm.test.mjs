import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isCrossOriginIsolated } from "../src/utils/wasm/coepHelper.js";
import { initializeWasmCompressorWorker } from "../src/utils/wasm/wasmWorker.js";

describe("COOP/COEP Cross-Origin Isolation Tests", () => {
  it("should detect environment isolation status", () => {
    const isIsolated = isCrossOriginIsolated();
    assert.equal(typeof isIsolated, "boolean");
  });

  it("should fallback cleanly if crossOriginIsolated is absent", () => {
    const worker = initializeWasmCompressorWorker();
    assert.ok(worker.mode);
    assert.equal(worker.sabAvailable, false); // No window context in Node tests, should be false
  });
});
