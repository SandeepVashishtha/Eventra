import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SyncMutexLock, QUEUE_ITEM_STATUS } from "../src/utils/syncMutexLock.js";

describe("Offline Queue Sync Mutex Lock & Idempotency Tests", () => {
  it("should acquire lock once and reject concurrent lock attempts", async () => {
    const mutex = new SyncMutexLock();

    const lockId1 = await mutex.acquireLock();
    assert.ok(lockId1);
    assert.equal(mutex.isLocked, true);

    // Concurrent attempt while locked
    const lockId2 = await mutex.acquireLock();
    assert.equal(lockId2, false);

    // Release lock
    mutex.releaseLock(lockId1);
    assert.equal(mutex.isLocked, false);

    // Next attempt succeeds
    const lockId3 = await mutex.acquireLock();
    assert.ok(lockId3);
    mutex.releaseLock(lockId3);
  });

  it("should generate valid UUID idempotency keys", () => {
    const mutex = new SyncMutexLock();
    const key1 = mutex.generateIdempotencyKey();
    const key2 = mutex.generateIdempotencyKey();

    assert.ok(typeof key1 === "string" && key1.length > 0);
    assert.ok(typeof key2 === "string" && key2.length > 0);
    assert.notEqual(key1, key2);
  });

  it("should support item status state machine transitions", () => {
    assert.equal(QUEUE_ITEM_STATUS.QUEUED, "QUEUED");
    assert.equal(QUEUE_ITEM_STATUS.PROCESSING, "PROCESSING");
    assert.equal(QUEUE_ITEM_STATUS.COMPLETED, "COMPLETED");
    assert.equal(QUEUE_ITEM_STATUS.FAILED, "FAILED");
  });
});
