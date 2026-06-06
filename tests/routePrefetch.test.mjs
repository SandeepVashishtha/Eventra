import assert from "node:assert/strict";
import {
  prefetchRoute,
  prefetchRoutesIdle,
  getPrefetchCacheSize,
  clearPrefetchCache,
} from "../src/utils/routePrefetch.js";

// Setup browser/window globals for the test environment
globalThis.window = globalThis.window || {};

(async function runTests() {
  console.log("Running routePrefetch unit tests...");

  // Test 1: prefetchRoute basic execution
  clearPrefetchCache();
  const p1 = prefetchRoute("events");
  assert.ok(p1 instanceof Promise, "prefetchRoute('events') should return a Promise");
  assert.equal(getPrefetchCacheSize(), 1, "Cache size should be 1 after one prefetch");

  const moduleResult = await p1;
  assert.ok(moduleResult, "Resolved module should not be empty");
  assert.equal(typeof moduleResult.default, "function", "Resolved module should export a default function");

  // Test 2: Caching / Deduplication
  const p2 = prefetchRoute("events");
  assert.strictEqual(p1, p2, "Consecutive calls to prefetchRoute('events') must return the exact same Promise instance");
  assert.equal(getPrefetchCacheSize(), 1, "Cache size should remain 1");

  // Test 3: Invalid route names
  const pInvalid = prefetchRoute("non_existent_route");
  assert.equal(pInvalid, undefined, "Invalid routes should return undefined");
  assert.equal(getPrefetchCacheSize(), 1, "Cache size should not change for invalid routes");

  // Test 4: prefetchRoutesIdle using requestIdleCallback
  clearPrefetchCache();
  let idleCallbackCalled = false;
  globalThis.window.requestIdleCallback = (callback) => {
    idleCallbackCalled = true;
    callback();
  };

  prefetchRoutesIdle(["events", "dashboard"]);
  assert.ok(idleCallbackCalled, "requestIdleCallback should be invoked when available");
  assert.equal(getPrefetchCacheSize(), 2, "Both idle routes should be prefetched");

  // Test 5: prefetchRoutesIdle using setTimeout fallback
  clearPrefetchCache();
  delete globalThis.window.requestIdleCallback;

  let setTimeoutCalled = false;
  const originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (callback, delay) => {
    setTimeoutCalled = true;
    assert.equal(delay, 2000, "setTimeout fallback should use 2000ms delay");
    callback();
  };

  prefetchRoutesIdle(["events", "dashboard"]);
  assert.ok(setTimeoutCalled, "setTimeout fallback should be invoked when requestIdleCallback is absent");
  assert.equal(getPrefetchCacheSize(), 2, "Both fallback idle routes should be prefetched");

  // Restore setTimeout
  globalThis.setTimeout = originalSetTimeout;

  console.log("All routePrefetch unit tests passed successfully! ✓");
})();
