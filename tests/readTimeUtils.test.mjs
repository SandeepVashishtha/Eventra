import assert from "node:assert/strict";
import { calculateReadTime, formatReadTime, getEventReadTime } from "../src/utils/readTimeUtils.js";

assert.equal(calculateReadTime(null), 0, "null input should return 0");
assert.equal(calculateReadTime(undefined), 0, "undefined input should return 0");
assert.equal(calculateReadTime(""), 0, "empty string should return 0");
assert.equal(calculateReadTime("  "), 1, "whitespace-only string should return 1 minute");
assert.equal(calculateReadTime("Hello world"), 1, "short text should return 1 minute");

const words200 = Array.from({ length: 200 }, (_, i) => `word${i}`).join(" ");
assert.ok(calculateReadTime(words200) >= 1, "200 words should return at least 1");

const words400 = Array.from({ length: 400 }, (_, i) => `word${i}`).join(" ");
assert.ok(calculateReadTime(words400) >= 2, "400 words should return at least 2 minutes");

const words1000 = Array.from({ length: 1000 }, (_, i) => `word${i}`).join(" ");
assert.ok(calculateReadTime(words1000) >= 5, "1000 words should return at least 5 minutes");

assert.equal(calculateReadTime("<p>Hello</p> <strong>World</strong>"), calculateReadTime("Hello World"), "HTML tags should be stripped before word count");

assert.equal(formatReadTime(0), "", "zero should return empty string");
assert.equal(formatReadTime(-5), "", "negative should return empty string");
assert.equal(formatReadTime(1), "1 min read", "1 minute should return correct format");
assert.equal(formatReadTime(2), "2 min read", "2 minutes should return correct format");
assert.equal(formatReadTime(10), "10 min read", "10 minutes should return correct format");

const result1 = getEventReadTime({ description: "" });
assert.equal(result1.minutes, 0, "empty description should return 0");
assert.equal(result1.display, "", "empty description display should be empty string");

const result2 = getEventReadTime({});
assert.equal(result2.minutes, 0, "missing description should return 0");

const result3 = getEventReadTime({ description: null });
assert.equal(result3.minutes, 0, "null description should return 0");

const result4 = getEventReadTime({ description: "One two three" });
assert.equal(result4.minutes, 1, "short description should return 1 minute");
assert.ok(result4.wordCount >= 3, "wordCount should be at least 3");

console.log("All readTimeUtils tests passed!");