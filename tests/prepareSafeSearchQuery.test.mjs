import assert from "node:assert/strict";
import { prepareSafeSearchQuery, validateSearchQuery } from "../src/utils/inputSanitization.js";

const origWarn = console.warn;
let warnings = [];
console.warn = (...args) => { warnings.push(args.join(" ")); };

try {
  assert.equal(prepareSafeSearchQuery("hello world"), "hello world", "valid query returned as-is");
  assert.equal(prepareSafeSearchQuery("test query 123"), "test query 123", "alphanumeric query accepted");

  assert.equal(prepareSafeSearchQuery(""), "", "empty string returns empty");
  assert.equal(prepareSafeSearchQuery(null), "", "null input returns empty");
  assert.equal(prepareSafeSearchQuery(undefined), "", "undefined input returns empty");

  assert.equal(prepareSafeSearchQuery("a".repeat(200)), "a".repeat(200), "query at exact 200 chars accepted");
  assert.equal(prepareSafeSearchQuery("a".repeat(201)), "", "query exceeding 200 chars returns empty");

  assert.equal(prepareSafeSearchQuery("valid query with spaces"), "valid query with spaces", "query with spaces accepted");
  assert.equal(prepareSafeSearchQuery("test-hyphen-chars"), "test-hyphen-chars", "hyphenated query accepted");

  const injectionQuery = "test;drop table--";
  assert.equal(prepareSafeSearchQuery(injectionQuery), "", "injection pattern returns empty");
  assert.ok(warnings.length > 0, "invalid query logs a warning");

  assert.equal(prepareSafeSearchQuery("query with $and {brackets}"), "", "NoSQL/JS patterns return empty");
  assert.equal(prepareSafeSearchQuery("query with [array]"), "", "array notation returns empty");

  const xssQuery = "query<script>alert(1)</script>";
  const sanitized = prepareSafeSearchQuery(xssQuery);
  assert.ok(!sanitized.includes("<"), "XSS script tags stripped");
  assert.ok(!sanitized.includes(">"), "XSS closing tags stripped");
  assert.ok(sanitized.includes("query"), "valid chars preserved");

  const tagQuery = "query with <tag>";
  const sanitizedTag = prepareSafeSearchQuery(tagQuery);
  assert.ok(!sanitizedTag.includes("<"), "angle brackets stripped");
  assert.ok(!sanitizedTag.includes(">"), "angle brackets stripped");

  assert.equal(prepareSafeSearchQuery(123), "", "non-string number returns empty");
  assert.equal(prepareSafeSearchQuery({ query: "test" }), "", "non-string object returns empty");

  const mixedCase = "Hello World TEST 123";
  assert.equal(prepareSafeSearchQuery(mixedCase), mixedCase, "mixed case alphanumeric accepted");

  const unicodeQuery = "cafe resuma french";
  assert.equal(prepareSafeSearchQuery(unicodeQuery), unicodeQuery, "unicode text accepted");
} finally {
  console.warn = origWarn;
}

console.log("All prepareSafeSearchQuery tests passed!");