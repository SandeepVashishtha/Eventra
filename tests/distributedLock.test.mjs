import assert from "node:assert/strict";
import test from "node:test";
import { getLockManager, withLock, resetLockManager } from "../api/_lib/distributed-lock.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test("InMemoryLockManager - Concurrency & TTL Behavior", async (t) => {
  // Ensure test environment for in-memory fallback
  process.env.NODE_ENV = "test";
  delete process.env.DISTRIBUTED_LOCK_REDIS_URL;
  delete process.env.RATE_LIMIT_REDIS_URL;

  t.after(() => {
    resetLockManager();
  });

  await t.test("should serialize lock execution", async () => {
    const execution = [];

    const p1 = withLock("test-key", async () => {
      execution.push("start-1");
      await delay(50);
      execution.push("end-1");
    });

    const p2 = withLock("test-key", async () => {
      execution.push("start-2");
      await delay(50);
      execution.push("end-2");
    });

    await Promise.all([p1, p2]);
    assert.deepEqual(execution, ["start-1", "end-1", "start-2", "end-2"]);
  });

  await t.test("should not expire queued lock requests while they are waiting in queue", async () => {
    const execution = [];

    // 1. First caller acquires the lock and holds it for 150ms
    const p1 = withLock("queue-test", async () => {
      execution.push("start-1");
      await delay(150);
      execution.push("end-1");
    });

    // 2. Second caller tries to acquire the lock with a short TTL (100ms)
    // In the buggy code, the 100ms TTL starts immediately when calling `acquire`.
    // Since p1 holds it for 150ms, the 100ms TTL fires before p1 finishes (at 100ms),
    // prematurely releasing lock 2 and unblocking any third caller.
    const p2 = withLock("queue-test", async () => {
      execution.push("start-2");
      await delay(20);
      execution.push("end-2");
    }, 100);

    // 3. Third caller tries to acquire the lock
    const p3 = withLock("queue-test", async () => {
      execution.push("start-3");
      await delay(20);
      execution.push("end-3");
    });

    await Promise.all([p1, p2, p3]);

    // Check that we didn't have concurrent executions.
    // Specifying execution order:
    // start-1, end-1 should complete before start-2 starts,
    // and start-2, end-2 should complete before start-3 starts.
    assert.deepEqual(execution, [
      "start-1",
      "end-1",
      "start-2",
      "end-2",
      "start-3",
      "end-3"
    ]);
  });
});
