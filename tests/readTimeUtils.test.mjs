import assert from "node:assert/strict";

const {
  calculateReadTime,
  formatReadTime,
  getEventReadTime,
} = await import("../src/utils/readTimeUtils.js");

assert.equal(calculateReadTime(""), 0, "empty text returns 0 minutes");
assert.equal(calculateReadTime(null), 0, "null text returns 0 minutes");
assert.equal(calculateReadTime("one"), 1, "short text has minimum 1 minute");

const paragraph = Array.from({ length: 400 }, (_, index) => `word${index}`).join(" ");
assert.equal(calculateReadTime(paragraph), 2, "400 words rounds up to 2 minutes");
assert.equal(
  calculateReadTime("<p>Hello <strong>world</strong></p>"),
  1,
  "strips HTML tags before counting words"
);

assert.equal(formatReadTime(0), "", "zero minutes formats to empty string");
assert.equal(formatReadTime(1), "1 min read", "singular minute label");
assert.equal(formatReadTime(3), "3 min read", "plural minute label");

const eventReadTime = getEventReadTime({ description: "Quick summary" });
assert.equal(eventReadTime.minutes, 1);
assert.equal(eventReadTime.display, "1 min read");
assert.equal(eventReadTime.wordCount, 2);

console.log("readTimeUtils tests passed ✓");
