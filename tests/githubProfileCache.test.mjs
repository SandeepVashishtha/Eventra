import assert from "node:assert/strict";

const {
  clearProfileCache,
  fetchProfileWithCache,
  fetchWithConcurrencyLimit,
  getCachedProfile,
  profileCacheSize,
  setCachedProfile,
} = await import("../src/utils/githubProfileCache.js");

clearProfileCache();

setCachedProfile("alice", { login: "alice", followers: 10 });
assert.deepEqual(getCachedProfile("alice"), { login: "alice", followers: 10 });
assert.equal(profileCacheSize(), 1);

let fetchCount = 0;
const fetcher = async (username) => {
  fetchCount += 1;
  return { login: username, followers: 1 };
};

const first = fetchProfileWithCache("bob", fetcher);
const second = fetchProfileWithCache("bob", fetcher);
assert.equal(first, second, "deduplicates in-flight profile requests");

await first;
assert.equal(fetchCount, 1, "only one network fetch for duplicate callers");
assert.deepEqual(getCachedProfile("bob"), { login: "bob", followers: 1 });

const results = await fetchWithConcurrencyLimit(
  [1, 2, 3, 4],
  async (value) => value * 2,
  2
);

assert.deepEqual(
  results.map((result) => result.value),
  [2, 4, 6, 8]
);

clearProfileCache();
assert.equal(profileCacheSize(), 0);

console.log("githubProfileCache tests passed ✓");
process.exit(0);

