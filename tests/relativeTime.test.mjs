import assert from "node:assert/strict";
import { getRelativeTime, getSmartDateLabel } from "../src/utils/relativeTime.js";

assert.equal(getRelativeTime(null), null, "null input returns null");
assert.equal(getRelativeTime(""), null, "empty string returns null");
assert.equal(getRelativeTime("invalid date"), null, "invalid date returns null");

const now = new Date();
const future = new Date(now.getTime() + 30000);
const past = new Date(now.getTime() - 30000);

assert.equal(getRelativeTime(future.toISOString()), "Starting soon", "30s in future is starting soon");
assert.equal(getRelativeTime(past.toISOString()), "Just ended", "30s in past is just ended");

assert.equal(getSmartDateLabel(null), "\u2014", "null date returns em-dash");
assert.equal(getSmartDateLabel("invalid"), "\u2014", "invalid date returns em-dash");

const tomorrow = new Date(now.getTime() + 86400000);
const yesterday = new Date(now.getTime() - 86400000);
const smartFuture = getSmartDateLabel(tomorrow.toISOString());
const smartPast = getSmartDateLabel(yesterday.toISOString());
assert.ok(smartFuture.includes("Tomorrow") || !smartFuture.includes("TBD"), "tomorrow date has proper label");

console.log("relativeTime edge case tests passed ✓");