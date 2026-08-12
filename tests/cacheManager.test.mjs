import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldCacheAsset, requestPersistentStorage, pruneLruCache } from "../src/utils/cacheManager.js";

describe("Service Worker Cache Storage Management Tests", () => {
  it("should exclude large video assets from caching target lists", () => {
    assert.equal(shouldCacheAsset("https://eventra.io/assets/banner.png"), true);
    assert.equal(shouldCacheAsset("https://eventra.io/assets/intro.mp4"), false);
    assert.equal(shouldCacheAsset("https://eventra.io/assets/promo.webm"), false);
  });

  it("should request persistent storage permission safely", async () => {
    const res = await requestPersistentStorage();
    assert.equal(typeof res, "boolean");
  });

  it("should run cache pruning cleanly in non-browser context", async () => {
    const deletedCount = await pruneLruCache("test-cache", 10);
    assert.equal(deletedCount, 0);
  });
});
