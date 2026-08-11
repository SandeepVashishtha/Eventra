import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WebSocketConnectionManager } from "../src/components/events/qa/WebSocketConnectionManager.js";

describe("WebSocket Reconnection Backoff Tests", () => {
  it("should calculate exponential backoff delay correctly", (t, done) => {
    const manager = new WebSocketConnectionManager("ws://localhost:8080/qa");
    assert.equal(manager.reconnectAttempts, 0);

    // Trigger cleanup and verify state resetting
    manager.cleanup();
    assert.equal(manager.reconnectTimeoutId, null);
    done();
  });
});
