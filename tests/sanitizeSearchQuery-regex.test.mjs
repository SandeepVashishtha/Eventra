import assert from "node:assert/strict";
import {
  escapeRegExp,
  prepareSafeSearchQuery,
} from "../src/utils/inputSanitization.js";

// escapeRegExp

assert.equal(escapeRegExp("hello world"), "hello world", "plain text unchanged");
assert.equal(escapeRegExp("hello.world"), "hello\\.world", "dot escaped");
assert.equal(escapeRegExp("C++"), "C\\+\\+", "plus escaped");
assert.equal(escapeRegExp("a*b?c^d$e"), "a\\*b\\?c\\^d\\$e", "regex metachars escaped");
assert.equal(escapeRegExp("(group)[x]{1}|y"), "\\(group\\)\\[x\\]\\{1\\}\\|y", "groups/braces/pipes escaped");
assert.equal(escapeRegExp(42), "", "non-string returns empty");
assert.equal(escapeRegExp(""), "", "empty stays empty");

// prepareSafeSearchQuery

assert.equal(prepareSafeSearchQuery("valid query"), "valid query", "simple query unchanged");
assert.equal(prepareSafeSearchQuery(""), "", "empty query unchanged");
assert.equal(prepareSafeSearchQuery("   "), "", "whitespace-only query becomes empty");
assert.equal(prepareSafeSearchQuery(123), "", "non-string query becomes empty");

assert.equal(
  prepareSafeSearchQuery("hello.world"),
  "hello\\.world",
  "regex metacharacters escaped for backend search",
);
assert.equal(
  prepareSafeSearchQuery("C++"),
  "C\\+\\+",
  "plus sign escaped for backend search",
);

// Disallowed input is rejected outright by validation (never silently mutated).
assert.equal(
  prepareSafeSearchQuery("line\nbreak"),
  "",
  "newlines rejected",
);
assert.equal(
  prepareSafeSearchQuery("<script>alert('xss')</script>"),
  "",
  "script payload rejected by validation",
);
assert.equal(
  prepareSafeSearchQuery("conference <img src=x onerror=alert(1)> 2026"),
  "",
  "embedded tag payload rejected",
);
assert.equal(
  prepareSafeSearchQuery("hello;world$[query]"),
  "",
  "NoSQL operators rejected",
);
assert.equal(
  prepareSafeSearchQuery("a".repeat(201)),
  "",
  "overlong query rejected",
);

console.log("sanitizeSearchQuery regex-safety tests passed!");
