import assert from "node:assert/strict";
import { sanitizeSearchQuery } from "../src/utils/inputSanitization.js";

assert.equal(sanitizeSearchQuery(null), "", "null input returns empty string");
assert.equal(sanitizeSearchQuery(undefined), "", "undefined input returns empty string");
assert.equal(sanitizeSearchQuery(123), "", "non-string input returns empty string");
assert.equal(sanitizeSearchQuery({ key: "value" }), "", "object input returns empty string");
assert.equal(sanitizeSearchQuery([]), "", "array input returns empty string");

assert.equal(sanitizeSearchQuery(""), "", "empty string returns empty string");
assert.equal(sanitizeSearchQuery("   "), "", "whitespace-only returns empty string after trim");

const baseQuery = "hello world search";
assert.equal(sanitizeSearchQuery(baseQuery), baseQuery, "simple query unchanged");

const longQuery = "a".repeat(500);
const sanitizedLong = sanitizeSearchQuery(longQuery);
assert.ok(sanitizedLong.length <= 200, "very long query is truncated to max 200");

const dangerousOnly = "$;{}[];'|\\<>";
assert.equal(sanitizeSearchQuery(dangerousOnly), "", "query with only dangerous chars returns empty");

const mixed = "hello;world$[query]";
const sanitizedMixed = sanitizeSearchQuery(mixed);
assert.ok(!sanitizedMixed.includes(";"), "semicolon removed");
assert.ok(!sanitizedMixed.includes("$"), "dollar sign removed");
assert.ok(!sanitizedMixed.includes("{"), "curly braces removed");
assert.ok(sanitizedMixed.includes("hello"), "valid chars preserved");
assert.ok(sanitizedMixed.includes("world"), "valid chars preserved");

const htmlChars = "test<script>alert('xss')</script>end";
const sanitizedHtml = sanitizeSearchQuery(htmlChars);
assert.ok(!sanitizedHtml.includes("<"), "less-than removed");
assert.ok(!sanitizedHtml.includes(">"), "greater-than removed");

assert.equal(sanitizeSearchQuery("a".repeat(200)), "a".repeat(200), "query at exact max length preserved");
assert.equal(sanitizeSearchQuery("a".repeat(201)), "a".repeat(200), "query exceeding max length truncated");

const newlines = "line1\nline2\rline3";
const sanitizedNewlines = sanitizeSearchQuery(newlines);
assert.ok(!sanitizedNewlines.includes("\n"), "newline removed");
assert.ok(!sanitizedNewlines.includes("\r"), "carriage return removed");

const backticks = "query`special`chars";
const sanitizedBackticks = sanitizeSearchQuery(backticks);
assert.ok(!sanitizedBackticks.includes("`"), "backticks removed");

const pipes = "echo | grep | awk";
const sanitizedPipes = sanitizeSearchQuery(pipes);
assert.ok(!sanitizedPipes.includes("|"), "pipes removed");

console.log("All sanitizeSearchQuery edge tests passed!");