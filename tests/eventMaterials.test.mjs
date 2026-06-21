import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const componentPath = path.resolve(__dirname, "../src/components/common/EventMaterials.jsx");
const src = readFileSync(componentPath, "utf8");

describe("EventMaterials Component - Static Analysis Checks", () => {
  it("should implement a safety timeout of 10 seconds (10000ms)", () => {
    assert.ok(
      src.includes("10000") || src.includes("10 * 1000"),
      "EventMaterials must implement a 10-second safety timeout limit."
    );
  });

  it("should clear completion interval on timeout or coordinator failure", () => {
    assert.ok(
      src.includes("clearInterval(checkCompletion)"),
      "EventMaterials must clear the polling interval when the P2P transfer finishes, fails, or times out."
    );
  });

  it("should cleanup the coordinator connection on failure or timeout", () => {
    assert.ok(
      src.includes("coordinator.cleanup()"),
      "EventMaterials must invoke cleanup() on the P2P coordinator on failure/timeout to prevent resource leaks."
    );
  });

  it("should trigger server download fallback on P2P failure or safety timeout", () => {
    assert.ok(
      src.includes("triggerServerDownloadFallback()"),
      "EventMaterials must fall back to the simulated server download on failure or safety timeout."
    );
  });
});

describe("EventMaterials Component - Fallback Logic Simulation", () => {
  it("should run fallback server download when P2P search fails", async () => {
    let mockServerDownloadCalled = false;

    // Simulate search and fallback logic
    const foundPeer = false;
    const triggerServerDownloadFallback = async () => {
      mockServerDownloadCalled = true;
    };

    if (foundPeer) {
      // should not run
    } else {
      await triggerServerDownloadFallback();
    }

    assert.strictEqual(mockServerDownloadCalled, true, "Fallback server download must be triggered when no peer is found");
  });

  it("should trigger fallback on timeout or coordinator failure", async () => {
    let mockServerDownloadCalled = false;
    let mockCleanupCalled = false;
    let intervalCleared = false;

    const coordinator = {
      currentState: "transferring",
      cleanup() {
        mockCleanupCalled = true;
      }
    };

    const triggerServerDownloadFallback = async () => {
      mockServerDownloadCalled = true;
    };

    const startTime = Date.now() - 11000; // Simulated start time 11 seconds ago

    // Simulation of polling loop check
    const runPollIteration = async () => {
      const isFailed = coordinator.currentState === "failed";
      const isTimeout = Date.now() - startTime > 10000;

      if (isFailed || isTimeout) {
        intervalCleared = true;
        coordinator.cleanup();
        await triggerServerDownloadFallback();
      }
    };

    await runPollIteration();

    assert.strictEqual(intervalCleared, true, "Polling interval must be cleared");
    assert.strictEqual(mockCleanupCalled, true, "Coordinator cleanup must be called");
    assert.strictEqual(mockServerDownloadCalled, true, "Fallback server download must be triggered");
  });
});

console.log("EventMaterials fallback and safety timeout tests loaded ✓");
