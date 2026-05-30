import assert from "node:assert/strict";
import { calculateReadTime, formatReadTime, getEventReadTime } from "../src/utils/readTimeUtils.js";

// Test calculateReadTime
assert.equal(calculateReadTime(null), 0, "null returns 0");
assert.equal(calculateReadTime(undefined), 0, "undefined returns 0");
assert.equal(calculateReadTime(""), 0, "empty string returns 0");
assert.equal(calculateReadTime(123), 0, "non-string returns 0");

// Test short text (should round up to minimum 1 minute)
assert.equal(calculateReadTime("Hello world"), 1, "short text returns 1");
assert.equal(calculateReadTime("<p>Hello <b>world</b></p>"), 1, "HTML tags are stripped and word count is correct");

// Test exactly 200 words (should be 1 minute)
const words200 = Array(200).fill("word").join(" ");
assert.equal(calculateReadTime(words200), 1, "200 words returns 1 minute");

// Test exactly 201 words (should round up to 2 minutes)
const words201 = Array(201).fill("word").join(" ");
assert.equal(calculateReadTime(words201), 2, "201 words returns 2 minutes");

// Test formatReadTime
assert.equal(formatReadTime(0), "", "0 minutes returns empty string");
assert.equal(formatReadTime(-5), "", "negative minutes returns empty string");
assert.equal(formatReadTime(1), "1 min read", "1 minute returns '1 min read'");
assert.equal(formatReadTime(5), "5 min read", "multiple minutes formatted correctly");

// Test getEventReadTime
const eventNoDesc = {};
const resultNoDesc = getEventReadTime(eventNoDesc);
assert.equal(resultNoDesc.minutes, 0, "missing description has 0 minutes");
assert.equal(resultNoDesc.display, "", "missing description has empty display");
assert.equal(resultNoDesc.wordCount, 0, "missing description has 0 wordCount");

const eventWithDesc = { description: "This is a simple event description with exactly eight words." };
const resultWithDesc = getEventReadTime(eventWithDesc);
assert.equal(resultWithDesc.minutes, 1, "valid description has 1 minute");
assert.equal(resultWithDesc.display, "1 min read", "valid description formatted correctly");
assert.equal(resultWithDesc.wordCount, 10, "valid description has correct word count");

console.log("readTimeUtils tests passed ✓");
