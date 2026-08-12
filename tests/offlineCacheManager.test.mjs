import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Global LocalStorage Mock for Node test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

import { getStorageQuotaEstimate } from "../src/utils/storage/storageQuotaUtils.js";
import {
  downloadEventPackForOffline,
  isEventDownloadedOffline,
  deleteOfflinePack,
  clearAllOfflinePacks,
} from "../src/utils/storage/offlineCacheManager.js";

describe("Offline Cache Manager & Storage Quota Tests", () => {
  beforeEach(() => {
    clearAllOfflinePacks();
  });

  it("should estimate device storage capacity cleanly", async () => {
    const quota = await getStorageQuotaEstimate();
    assert.ok(typeof quota.usageMB === "number");
    assert.ok(typeof quota.quotaMB === "number");
    assert.ok(quota.quotaMB >= quota.usageMB);
  });

  it("should download and manage offline event media packs", async () => {
    const eventSample = { id: "evt-101", title: "Global Open Source Summit" };

    const success = await downloadEventPackForOffline(eventSample);
    assert.equal(success, true);
    assert.equal(isEventDownloadedOffline("evt-101"), true);

    deleteOfflinePack("evt-101");
    assert.equal(isEventDownloadedOffline("evt-101"), false);
  });
});
