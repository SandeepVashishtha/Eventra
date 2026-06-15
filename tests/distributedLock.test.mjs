import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryLockManager, withLock } from "../api/_lib/distributed-lock.js";

describe("InMemoryLockManager", () => {
  it("should acquire and release a lock successfully", async () => {
    const manager = new InMemoryLockManager();
    const release = await manager.acquire("test-key");
    assert.strictEqual(typeof release, "function");
    
    // Verify lock is in the map
    assert.strictEqual(manager.locks.has("test-key"), true);
    assert.strictEqual(manager.locks.get("test-key").length, 1);

    release();

    // Verify lock is cleaned up from map
    assert.strictEqual(manager.locks.has("test-key"), false);
  });

  it("should execute concurrent requests sequentially in FIFO order", async () => {
    const manager = new InMemoryLockManager();
    const order = [];

    const release1 = await manager.acquire("fifo-key");
    order.push(1);

    // Request 2 (should block)
    const p2 = manager.acquire("fifo-key").then((rel) => {
      order.push(2);
      return rel;
    });

    // Request 3 (should block)
    const p3 = manager.acquire("fifo-key").then((rel) => {
      order.push(3);
      return rel;
    });

    // Give microtasks time to register
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.deepStrictEqual(order, [1]);
    assert.strictEqual(manager.locks.get("fifo-key").length, 3);

    // Release 1, allowing 2 to run
    release1();
    const release2 = await p2;
    assert.deepStrictEqual(order, [1, 2]);
    assert.strictEqual(manager.locks.get("fifo-key").length, 2);

    // Release 2, allowing 3 to run
    release2();
    const release3 = await p3;
    assert.deepStrictEqual(order, [1, 2, 3]);
    assert.strictEqual(manager.locks.get("fifo-key").length, 1);

    release3();
    assert.strictEqual(manager.locks.has("fifo-key"), false);
  });

  it("should reject and remove the request from queue when it times out", async () => {
    const manager = new InMemoryLockManager();
    const release1 = await manager.acquire("timeout-key");

    // Request 2 with short TTL
    let error = null;
    const p2 = manager.acquire("timeout-key", 50).catch((err) => {
      error = err;
    });

    // Wait for timeout to fire
    await new Promise((resolve) => setTimeout(resolve, 80));

    assert.ok(error);
    assert.strictEqual(error.message, "Lock acquisition timeout");

    // Request 2 should have been removed from the queue
    const queue = manager.locks.get("timeout-key");
    assert.strictEqual(queue.length, 1); // Only Request 1 remains

    release1();
    assert.strictEqual(manager.locks.has("timeout-key"), false);
  });

  it("should not cause queue starvation when an intermediate request times out", async () => {
    const manager = new InMemoryLockManager();
    const order = [];

    const release1 = await manager.acquire("starve-key");
    order.push(1);

    // Request 2 with short TTL (will time out)
    const p2 = manager.acquire("starve-key", 50).catch((err) => {
      order.push("timeout-2");
    });

    // Request 3 with long TTL (should eventually run)
    const p3 = manager.acquire("starve-key", 1000).then((rel) => {
      order.push(3);
      return rel;
    });

    // Wait for Request 2 to time out
    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.deepStrictEqual(order, [1, "timeout-2"]);

    // Queue should now contain Request 1 and Request 3
    const queue = manager.locks.get("starve-key");
    assert.strictEqual(queue.length, 2);

    // Release Request 1
    release1();
    const release3 = await p3;
    assert.deepStrictEqual(order, [1, "timeout-2", 3]);

    release3();
    assert.strictEqual(manager.locks.has("starve-key"), false);
  });
});

describe("withLock Helper", () => {
  it("should execute the callback and release the lock automatically", async () => {
    let executed = false;
    const result = await withLock("helper-key", async () => {
      executed = true;
      return "success";
    });

    assert.strictEqual(executed, true);
    assert.strictEqual(result, "success");
  });

  it("should release the lock even if the callback throws", async () => {
    try {
      await withLock("throw-key", async () => {
        throw new Error("inner error");
      });
      assert.fail("Should have thrown");
    } catch (err) {
      assert.strictEqual(err.message, "inner error");
    }
  });
});
