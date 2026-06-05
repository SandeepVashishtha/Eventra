import assert from "node:assert/strict";

import {
  sanitizeSearchQuery,
  validateSearchQuery,
  prepareSafeSearchQuery,
  sanitizeInputText
} from "../src/utils/inputSanitization.js";

// Test sanitizeSearchQuery
assert.strictEqual(sanitizeSearchQuery("hello"), "hello", "Normal text should pass through");
assert.strictEqual(sanitizeSearchQuery(""), "", "Empty string should return empty");
assert.strictEqual(sanitizeSearchQuery(null), "", "null should return empty");
assert.strictEqual(sanitizeSearchQuery(undefined), "", "undefined should return empty");
assert.strictEqual(sanitizeSearchQuery(123), "", "Non-string should return empty");
assert.strictEqual(sanitizeSearchQuery("hello world"), "hello world", "Text with space should pass");

assert.strictEqual(sanitizeSearchQuery("hello;drop table"), "hellodrop table", "Semicolons should be removed");
assert.strictEqual(sanitizeSearchQuery("test' OR '1'='1"), "test OR 1=1", "Single quotes should be removed, equals and numbers remain");
assert.strictEqual(sanitizeSearchQuery("<script>alert('xss')</script>"), "", "Script tag payloads should be removed");
assert.strictEqual(sanitizeSearchQuery("<img src=x onerror=alert(1)>"), "", "Image onerror payloads should be removed");
assert.strictEqual(
  sanitizeSearchQuery("<svg><animateTransform onbegin=alert(1)></animateTransform></svg>"),
  "",
  "SVG animation handlers should be removed"
);
assert.strictEqual(
  sanitizeSearchQuery("<math><mtext><img src=x onerror=alert(1)></mtext></math> algebra"),
  "algebra",
  "MathML-based HTML payloads should be removed while preserving plain terms"
);
assert.strictEqual(
  sanitizeSearchQuery('<a href="data:text/html,<script>alert(1)</script>">report</a>'),
  "report",
  "Data URI attributes should be stripped while preserving harmless link text"
);
assert.strictEqual(
  sanitizeSearchQuery("data:text/html,<svg onload=alert(1)> report"),
  "report",
  "Raw data URI payloads should be removed from search text"
);
assert.strictEqual(sanitizeSearchQuery("<<test>>"), "", "Malformed angle-bracket input should be neutralized");
assert.strictEqual(sanitizeSearchQuery("test < raw > query"), "test query", "Raw angle brackets should be removed");
assert.strictEqual(sanitizeSearchQuery("events javascript:alert(1) today"), "events today", "Script fragments should be removed");
assert.strictEqual(sanitizeSearchQuery("find <script>alert('xss')</script> workshops"), "find workshops", "Mixed safe and unsafe text should preserve safe terms");
assert.strictEqual(sanitizeSearchQuery("test|grep"), "testgrep", "Pipes should be removed");
assert.strictEqual(sanitizeSearchQuery("test\nline"), "testline", "Newlines should be removed");
assert.strictEqual(sanitizeSearchQuery("test{json}"), "testjson", "Braces should be removed");

const longString = "a".repeat(250);
assert.strictEqual(sanitizeSearchQuery(longString).length, 200, "Should truncate to 200 chars");

// Test validateSearchQuery
assert.deepEqual(validateSearchQuery("hello"), { isValid: true, error: null }, "Valid text should pass");
assert.deepEqual(validateSearchQuery(""), { isValid: true, error: null }, "Empty is valid (returns all)");
assert.deepEqual(validateSearchQuery(null), { isValid: false, error: "Search query must be a string" }, "null should be invalid");
assert.deepEqual(validateSearchQuery(123), { isValid: false, error: "Search query must be a string" }, "Non-string should be invalid");

assert.deepEqual(validateSearchQuery("a".repeat(201)), { isValid: false, error: "Search query must be less than 200 characters" }, "Too long should be invalid");
assert.deepEqual(validateSearchQuery("test$where"), { isValid: false, error: "Search query contains invalid characters" }, "Injection pattern should be invalid");
assert.deepEqual(validateSearchQuery("test[1]"), { isValid: false, error: "Search query contains invalid characters" }, "Array notation should be invalid");

// Test prepareSafeSearchQuery
assert.strictEqual(prepareSafeSearchQuery("hello"), "hello", "Valid query should pass through");
assert.strictEqual(prepareSafeSearchQuery(""), "", "Empty should return empty");
assert.strictEqual(prepareSafeSearchQuery("test;drop"), "", "Invalid with injection should return empty");
assert.strictEqual(prepareSafeSearchQuery("test<script>"), "test", "Script tags should be sanitized, not rejected");
assert.strictEqual(prepareSafeSearchQuery(123), "", "Non-string should return empty");

// Test sanitizeInputText
assert.strictEqual(sanitizeInputText("hello"), "hello", "Normal text should pass");
assert.strictEqual(sanitizeInputText(""), "", "Empty should return empty");
assert.strictEqual(sanitizeInputText(null), "", "null should return empty");
assert.strictEqual(sanitizeInputText(123), "", "Non-string should return empty");
assert.strictEqual(sanitizeInputText("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;", "Script tags should be escaped");
assert.strictEqual(sanitizeInputText('"quoted"'), "&quot;quoted&quot;", "Quotes should be escaped");
assert.strictEqual(sanitizeInputText("a&b"), "a&amp;b", "Ampersands should be escaped");
assert.strictEqual(sanitizeInputText("a<b"), "a&lt;b", "Less than should be escaped");
assert.strictEqual(sanitizeInputText("a>b"), "a&gt;b", "Greater than should be escaped");
assert.strictEqual(sanitizeInputText("a/b"), "a&#x2F;b", "Forward slash should be escaped");

console.log("inputSanitization tests passed ✓");
