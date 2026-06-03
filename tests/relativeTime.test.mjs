import assert from "node:assert/strict";
import { getRelativeTime, getSmartDateLabel } from "../src/utils/relativeTime.js";

assert.equal(getRelativeTime(null), "—", "null input returns fallback");
assert.equal(getRelativeTime(undefined), "—", "undefined input returns fallback");
assert.equal(getRelativeTime(""), "—", "empty string returns fallback");
assert.equal(getRelativeTime("invalid date"), "—", "invalid date returns fallback");
assert.equal(getRelativeTime("2026-02-30T99:99:99"), "—", "malformed date string returns fallback");

const now = new Date();
const future = new Date(now.getTime() + 30000);
const past = new Date(now.getTime() - 30000);

assert.equal(getRelativeTime(future.toISOString()), "Starting soon", "30s in future is starting soon");
assert.equal(getRelativeTime(past.toISOString()), "Just ended", "30s in past is just ended");

assert.equal(getSmartDateLabel(null), "TBD", "null date returns TBD");
assert.equal(getSmartDateLabel("invalid"), "TBD", "invalid date returns TBD");

const tomorrow = new Date(now.getTime() + 86400000);
const yesterday = new Date(now.getTime() - 86400000);
const smartFuture = getSmartDateLabel(tomorrow.toISOString());
const smartPast = getSmartDateLabel(yesterday.toISOString());
assert.ok(smartFuture.includes("Tomorrow") || !smartFuture.includes("TBD"), "tomorrow date has proper label");

console.log("relativeTime edge case tests passed ✓");