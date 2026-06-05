import assert from "node:assert/strict";
import { getCachedProfile, setCachedProfile, clearProfileCache, profileCacheSize } from "../src/utils/githubProfileCache.js";

clearProfileCache();
assert.equal(profileCacheSize(), 0);

setCachedProfile("user1", { name: "User One" });
const profile = getCachedProfile("user1");
assert.equal(profile.name, "User One");
assert.equal(profileCacheSize(), 1);

clearProfileCache();
assert.equal(getCachedProfile("user1"), null);

console.log("githubProfileCache edge tests passed ✓");
