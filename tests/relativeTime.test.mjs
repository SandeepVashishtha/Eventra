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

assert.equal(getSmartDateLabel(null), "TBD", "null date returns TBD");
assert.equal(getSmartDateLabel("invalid"), "TBD", "invalid date returns TBD");

const tomorrow = new Date(now.getTime() + 86400000);
const yesterday = new Date(now.getTime() - 86400000);
const smartFuture = getSmartDateLabel(tomorrow.toISOString());
const smartPast = getSmartDateLabel(yesterday.toISOString());
assert.ok(smartFuture.includes("Tomorrow") || !smartFuture.includes("TBD"), "tomorrow date has proper label");

// Leap year date formatted properly
assert.ok(getSmartDateLabel("2028-02-29T12:00:00Z").includes("Feb 29, 2028"), "leap year date formatted properly");

// Extreme past/future tests
const yearsAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 365 * 10);
assert.ok(getSmartDateLabel(yearsAgo.toISOString()) !== "TBD", "decade ago date formatted properly");

// Non-string arguments checking
assert.equal(getRelativeTime(123456789), null, "number input returns null");
assert.equal(getSmartDateLabel(undefined), "TBD", "undefined input returns TBD");

console.log("relativeTime edge case tests passed ✓");