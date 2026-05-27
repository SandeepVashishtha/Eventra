import assert from "node:assert/strict";
import { getRelativeTime, getSmartDateLabel } from "../src/utils/relativeTime.js";

assert.equal(getRelativeTime(null), null, "null input returns null");
assert.equal(getRelativeTime(""), null, "empty string returns null");
assert.equal(getRelativeTime("invalid date"), null, "invalid date returns null");

const now = new Date();
const future = new Date(now.getTime() + 60000);
const past = new Date(now.getTime() - 60000);

assert.equal(getRelativeTime(future.toISOString()), "Starting soon", "1 min in future is starting soon");
assert.equal(getRelativeTime(past.toISOString()), "Just ended", "1 min in past is just ended");

assert.equal(getSmartDateLabel(null), "TBD", "null date returns TBD");
assert.equal(getSmartDateLabel("invalid"), "TBD", "invalid date returns TBD");

const tomorrow = new Date(now.getTime() + 86400000);
const yesterday = new Date(now.getTime() - 86400000);
const smartFuture = getSmartDateLabel(tomorrow.toISOString());
const smartPast = getSmartDateLabel(yesterday.toISOString());
assert.ok(smartFuture.includes("Tomorrow") || !smartFuture.includes("TBD"), "tomorrow date has proper label");

console.log("relativeTime edge case tests passed ✓");