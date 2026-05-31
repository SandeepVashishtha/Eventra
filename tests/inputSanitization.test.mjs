import assert from "node:assert/strict";
import {
  sanitizeSearchQuery,
  validateSearchQuery,
  prepareSafeSearchQuery,
  sanitizeInputText,
} from "../src/utils/inputSanitization.js";

// sanitizeSearchQuery tests
assert.strictEqual(sanitizeSearchQuery(null), "", "null returns empty string");
assert.strictEqual(sanitizeSearchQuery(undefined), "", "undefined returns empty string");
assert.strictEqual(sanitizeSearchQuery(""), "", "empty string returns empty string");
assert.strictEqual(sanitizeSearchQuery("  "), "", "whitespace-only returns empty string");
assert.strictEqual(sanitizeSearchQuery("hello world"), "hello world", "normal text passes through");
assert.strictEqual(sanitizeSearchQuery("hello-world_123"), "hello-world_123", "alphanumeric with hyphen underscore passes");
assert.strictEqual(sanitizeSearchQuery("$where"), "where", "$ removed leaving 'where'");
assert.strictEqual(sanitizeSearchQuery("{$q}"), "q", "$ and braces removed");
assert.strictEqual(sanitizeSearchQuery("[1,2,3]"), "1,2,3", "brackets removed, commas and digits remain");
assert.strictEqual(sanitizeSearchQuery(";DROP TABLE"), "DROP TABLE", "semicolon removed leaving DROP TABLE");
assert.strictEqual(sanitizeSearchQuery("'`|\\"), "", "backtick, single-quote, pipe, backslash removed");
assert.strictEqual(sanitizeSearchQuery("line1\nline2"), "line1line2", "newlines removed");
assert.strictEqual(sanitizeSearchQuery("line1\rline2"), "line1line2", "carriage returns removed");
assert.strictEqual(sanitizeSearchQuery("<script>"), "script", "angle brackets removed leaving 'script'");
assert.strictEqual(sanitizeSearchQuery(">alert<"), "alert", "angle brackets removed leaving 'alert'");
assert.strictEqual(sanitizeSearchQuery("a".repeat(250)).length, 200, "max length enforced at 200");

// validateSearchQuery tests
assert.deepStrictEqual(validateSearchQuery(null), { isValid: false, error: "Search query must be a string" }, "null is invalid");
assert.deepStrictEqual(validateSearchQuery(undefined), { isValid: true, error: null }, "undefined treated as empty string, valid");
assert.deepStrictEqual(validateSearchQuery(123), { isValid: false, error: "Search query must be a string" }, "number is invalid");
assert.deepStrictEqual(validateSearchQuery(""), { isValid: true, error: null }, "empty string is valid");
assert.deepStrictEqual(validateSearchQuery("  "), { isValid: true, error: null }, "whitespace-only is valid");
assert.deepStrictEqual(validateSearchQuery("hello"), { isValid: true, error: null }, "normal text is valid");
assert.deepStrictEqual(validateSearchQuery("a".repeat(201)), { isValid: false, error: "Search query must be less than 200 characters" }, ">200 chars is invalid");
assert.deepStrictEqual(validateSearchQuery("${query}"), { isValid: false, error: "Search query contains invalid characters" }, "$ is invalid");
assert.deepStrictEqual(validateSearchQuery("query{}"), { isValid: false, error: "Search query contains invalid characters" }, "braces are invalid");
assert.deepStrictEqual(validateSearchQuery("query[]"), { isValid: false, error: "Search query contains invalid characters" }, "brackets are invalid");
assert.deepStrictEqual(validateSearchQuery("query;"), { isValid: false, error: "Search query contains invalid characters" }, "semicolon is invalid");
assert.deepStrictEqual(validateSearchQuery("query`"), { isValid: false, error: "Search query contains invalid characters" }, "backtick is invalid");
assert.deepStrictEqual(validateSearchQuery("query'"), { isValid: false, error: "Search query contains invalid characters" }, "single quote is invalid");
assert.deepStrictEqual(validateSearchQuery("query|"), { isValid: false, error: "Search query contains invalid characters" }, "pipe is invalid");
assert.deepStrictEqual(validateSearchQuery("query\\"), { isValid: false, error: "Search query contains invalid characters" }, "backslash is invalid");

// prepareSafeSearchQuery tests
assert.strictEqual(prepareSafeSearchQuery("hello"), "hello", "valid input returns sanitized");
assert.strictEqual(prepareSafeSearchQuery(""), "", "empty string returns empty");
assert.strictEqual(prepareSafeSearchQuery("${malicious}"), "", "injection returns empty string");
assert.strictEqual(prepareSafeSearchQuery("a".repeat(250)), "", "overlength returns empty");

// sanitizeInputText tests
assert.strictEqual(sanitizeInputText(null), "", "null returns empty");
assert.strictEqual(sanitizeInputText(undefined), "", "undefined returns empty");
assert.strictEqual(sanitizeInputText(""), "", "empty string returns empty");
assert.strictEqual(sanitizeInputText("hello"), "hello", "plain text unchanged");
assert.strictEqual(sanitizeInputText("hello world"), "hello world", "text with spaces unchanged");
assert.strictEqual(sanitizeInputText("&"), "&amp;", "& escaped");
assert.strictEqual(sanitizeInputText("<"), "&lt;", "< escaped");
assert.strictEqual(sanitizeInputText(">"), "&gt;", "> escaped");
assert.strictEqual(sanitizeInputText('"'), "&quot;", "double quote escaped");
assert.strictEqual(sanitizeInputText("'"), "&#x27;", "single quote escaped");
assert.strictEqual(sanitizeInputText("/"), "&#x2F;", "forward slash escaped");
assert.strictEqual(sanitizeInputText("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;", "XSS attempt escaped");

console.log("All inputSanitization tests passed");