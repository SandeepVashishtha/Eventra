import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OfflineStorageQueue } from "../src/utils/offlineStorage.js";

describe("IndexedDB Mutex-Guarded Offline Storage Tests", () => {
  it("should process concurrent writes sequentially without lock deadlocks", async () => {
    const store = new OfflineStorageQueue();

    // Trigger multiple concurrent writes in parallel
    const p1 = store.enqueueWriteTask("evt-1", { title: "Workshop A" });
    const p2 = store.enqueueWriteTask("evt-2", { title: "Workshop B" });
    const p3 = store.enqueueWriteTask("evt-1", { title: "Workshop A Updated" });

    await Promise.all([p1, p2, p3]);

    assert.equal(store.getItem("evt-2").title, "Workshop B");
    assert.equal(store.getItem("evt-1").title, "Workshop A Updated");
  });
});
