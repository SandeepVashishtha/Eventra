import assert from "node:assert/strict";

const store = {};
globalThis.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  }
};

import { calculateReadTime, formatReadTime, getEventReadTime } from "../src/utils/readTimeUtils.js";

// Test calculateReadTime
assert.strictEqual(calculateReadTime(""), 0, "Empty string should return 0");
assert.strictEqual(calculateReadTime(null), 0, "null should return 0");
assert.strictEqual(calculateReadTime(undefined), 0, "undefined should return 0");
assert.strictEqual(calculateReadTime(123), 0, "Non-string should return 0");
assert.strictEqual(calculateReadTime("<p>Hello world</p>"), 1, "HTML tags should be stripped");
assert.strictEqual(calculateReadTime("hello"), 1, "Single word should return 1 min");
const longText = "word ".repeat(600);
assert.strictEqual(calculateReadTime(longText), 3, "600 words should be ~3 min at 200 wpm");

// Test formatReadTime
assert.strictEqual(formatReadTime(0), "", "0 should return empty string");
assert.strictEqual(formatReadTime(-5), "", "Negative should return empty string");
assert.strictEqual(formatReadTime(1), "1 min read", "1 minute should be formatted correctly");
assert.strictEqual(formatReadTime(3), "3 min read", "3 minutes should be formatted correctly");
assert.strictEqual(formatReadTime(10), "10 min read", "10 minutes should be formatted correctly");

// Test getEventReadTime
const eventWithDesc = { description: "This is a test event description with enough words to calculate read time." };
const result1 = getEventReadTime(eventWithDesc);
assert.ok(result1.minutes >= 1, "Should return at least 1 minute");
assert.ok(result1.display.includes("min read"), "Display should include min read");
assert.ok(result1.wordCount > 0, "Word count should be positive");

const emptyDescEvent = { description: "" };
const result2 = getEventReadTime(emptyDescEvent);
assert.strictEqual(result2.minutes, 0, "Empty description returns 0 from calculateReadTime");

const noDescEvent = {};
const result3 = getEventReadTime(noDescEvent);
assert.strictEqual(result3.minutes, 0, "Missing description (empty event) returns 0");

const nullDescEvent = { description: null };
const result4 = getEventReadTime(nullDescEvent);
assert.strictEqual(result4.minutes, 0, "null description returns 0");

console.log("readTimeUtils tests passed ✓");