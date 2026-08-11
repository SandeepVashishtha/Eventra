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

import {
  addToWaitlist,
  promoteNextUser,
  confirmPromotionWithMutex,
  clearWaitlist,
} from "../src/utils/waitlistPromotionUtils.js";

describe("Service Worker Background Sync Mutex Tests", () => {
  beforeEach(() => {
    clearWaitlist();
  });

  it("should generate promotion token and prevent duplicate background sync seat confirmations", () => {
    addToWaitlist({ userId: "u-1", eventId: "evt-1" });
    const promotedUser = promoteNextUser("evt-1");

    assert.ok(promotedUser);
    assert.equal(promotedUser.status, "promoted");
    assert.ok(promotedUser.promotionToken);

    // First Background Sync confirmation
    const firstSync = confirmPromotionWithMutex("u-1", "evt-1", promotedUser.promotionToken);
    assert.equal(firstSync.success, true);

    // Duplicate parallel Background Sync retry (simulating SW latency retry)
    const duplicateSync = confirmPromotionWithMutex("u-1", "evt-1", promotedUser.promotionToken);
    assert.equal(duplicateSync.success, false);
    assert.equal(duplicateSync.duplicate, true);
  });
});
