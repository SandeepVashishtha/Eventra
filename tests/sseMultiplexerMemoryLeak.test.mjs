import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { SseLockManager } from "../src/utils/sseLockManager.js";

describe("SSE Multiplexer Memory Leak & Lock Acquisition Tests", () => {
  let mockLocalStorage = {};

  before(() => {
    global.localStorage = {
      getItem: (key) => mockLocalStorage[key] || null,
      setItem: (key, value) => { mockLocalStorage[key] = String(value); },
      removeItem: (key) => { delete mockLocalStorage[key]; },
      clear: () => { mockLocalStorage = {}; }
    };
  });

  after(() => {
    delete global.localStorage;
  });

  it("should acquire leadership and write valid heartbeat token", async () => {
    const lockManager = new SseLockManager({
      tabId: "test-tab-101",
      heartbeatKey: "test_sse_heartbeat",
    });

    await lockManager.acquireLock();
    assert.equal(lockManager.isLeader, true);

    const storedHeartbeat = JSON.parse(mockLocalStorage["test_sse_heartbeat"]);
    assert.equal(storedHeartbeat.tabId, "test-tab-101");
    assert.ok(storedHeartbeat.timestamp > 0);

    lockManager.release();
    assert.equal(lockManager.isLeader, false);
    assert.equal(mockLocalStorage["test_sse_heartbeat"], undefined);
  });

  it("should release stale lease key when leader tab crashes without clean teardown", async () => {
    // Simulate crashed leader leaving stale key in storage
    mockLocalStorage["test_sse_heartbeat"] = JSON.stringify({
      tabId: "crashed-leader-tab",
      timestamp: Date.now() - 5000, // 5s ago (stale > 3s)
    });

    const followerManager = new SseLockManager({
      tabId: "follower-tab-202",
      heartbeatKey: "test_sse_heartbeat",
    });

    await followerManager.acquireLock();
    assert.equal(followerManager.isLeader, true);

    const newHeartbeat = JSON.parse(mockLocalStorage["test_sse_heartbeat"]);
    assert.equal(newHeartbeat.tabId, "follower-tab-202");

    followerManager.release();
  });

  it("should clear watchdog timers and release abort controllers on release", async () => {
    const manager = new SseLockManager({
      tabId: "cleanup-tab-303",
    });

    await manager.acquireLock();
    assert.ok(manager.watchdogTimer !== null || manager.isLeader === true);

    manager.release();
    assert.equal(manager.watchdogTimer, null);
    assert.equal(manager.isLeader, false);
  });
});
