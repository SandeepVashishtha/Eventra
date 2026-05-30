import assert from "node:assert/strict";

// Mock Date.now to test TTL expiration
const originalDateNow = Date.now;
let mockTime = originalDateNow();
global.Date.now = () => mockTime;

// Import githubProfileCache functions
import {
  getCachedProfile,
  setCachedProfile,
  fetchProfileWithCache,
  fetchWithConcurrencyLimit,
  clearProfileCache,
  profileCacheSize,
  getEvictionThreshold
} from "../src/utils/githubProfileCache.js";

// Test 1: setCachedProfile and getCachedProfile
clearProfileCache();
assert.equal(profileCacheSize(), 0, "cache is initially empty");
assert.equal(getCachedProfile("user1"), null, "getCachedProfile returns null for miss");

const mockData = { login: "user1", bio: "hello" };
setCachedProfile("user1", mockData);
assert.equal(profileCacheSize(), 1, "cache has 1 item after set");
assert.deepEqual(getCachedProfile("user1"), mockData, "getCachedProfile returns cached data");

// Test 2: cache TTL eviction
const ttl = getEvictionThreshold();
mockTime += ttl + 100; // fast-forward past TTL
assert.equal(getCachedProfile("user1"), null, "getCachedProfile returns null after expiration");
assert.equal(profileCacheSize(), 0, "expired item is evicted");

// Test 3: fetchProfileWithCache caching and deduplication
clearProfileCache();
mockTime = originalDateNow(); // restore standard time

let fetcherCalls = 0;
const fetcher = async (username) => {
  fetcherCalls++;
  return { username, calls: fetcherCalls };
};

// First fetch should call fetcher
const promise1 = fetchProfileWithCache("user2", fetcher);
// Simultaneous second fetch should be deduplicated (use same in-flight promise, no extra fetcher call)
const promise2 = fetchProfileWithCache("user2", fetcher);

assert.equal(promise1, promise2, "in-flight requests are deduplicated and share promise");

const res1 = await promise1;
const res2 = await promise2;

assert.equal(fetcherCalls, 1, "fetcher is only called once");
assert.deepEqual(res1, { username: "user2", calls: 1 }, "returned data is correct");
assert.deepEqual(res2, { username: "user2", calls: 1 }, "returned deduplicated data is correct");
assert.deepEqual(getCachedProfile("user2"), { username: "user2", calls: 1 }, "data is cached after promise resolves");

// Subsequent fetch should hit cached profile
const resCached = await fetchProfileWithCache("user2", fetcher);
assert.equal(fetcherCalls, 1, "subsequent fetch does not invoke fetcher");
assert.deepEqual(resCached, { username: "user2", calls: 1 }, "returns cached data");

// Test 4: fetchWithConcurrencyLimit
let currentInFlight = 0;
let maxInFlight = 0;
const taskFn = async (item) => {
  currentInFlight++;
  maxInFlight = Math.max(maxInFlight, currentInFlight);
  await new Promise((resolve) => setTimeout(resolve, 10));
  currentInFlight--;
  return item * 2;
};

const items = [1, 2, 3, 4, 5, 6, 7, 8];
const concurrency = 3;
const limitResults = await fetchWithConcurrencyLimit(items, taskFn, concurrency);

assert.equal(limitResults.length, 8, "processes all items");
assert.ok(maxInFlight <= concurrency, "respects concurrency limit");
assert.deepEqual(
  limitResults.map((r) => r.value),
  [2, 4, 6, 8, 10, 12, 14, 16],
  "returns correct results in same order"
);

// Restore original Date.now
global.Date.now = originalDateNow;

console.log("githubProfileCache tests passed ✓");
process.exit(0);
