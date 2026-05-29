import assert from "node:assert/strict";
import {
  sanitizeSearchQuery,
  validateSearchQuery,
  prepareSafeSearchQuery,
  sanitizeInputText
} from "../src/utils/inputSanitization.js";

assert.equal(sanitizeSearchQuery("test query"), "test query", "normal query passthrough");
assert.equal(sanitizeSearchQuery("test<script>"), "testscript", "HTML tags stripped");
assert.equal(sanitizeSearchQuery("test $query"), "test query", "dollar sign removed");
assert.equal(sanitizeSearchQuery("test'query"), "testquery", "quotes removed");
assert.equal(sanitizeSearchQuery("a".repeat(300)), "a".repeat(200), "max length enforced");

const emptyResult = { isValid: true, error: null };
assert.deepEqual(validateSearchQuery(""), emptyResult, "empty is valid");
assert.deepEqual(validateSearchQuery("valid query"), emptyResult, "valid query passes");
assert.deepEqual(validateSearchQuery("test $ invalid"), { isValid: false, error: "Search query contains invalid characters" }, "invalid chars rejected");
assert.deepEqual(validateSearchQuery("a".repeat(201)), { isValid: false, error: "Search query must be less than 200 characters" }, "too long rejected");

assert.equal(prepareSafeSearchQuery("test"), "test", "safe query passed through");
assert.equal(prepareSafeSearchQuery("test $ inject"), "", "injection blocked");

assert.equal(sanitizeInputText("<script>alert('xss')</script>"), "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;", "XSS prevented");
assert.equal(sanitizeInputText("Hello & Goodbye"), "Hello &amp; Goodbye", "HTML entities escaped");
assert.equal(sanitizeInputText("Test \"quotes\""), "Test &quot;quotes&quot;", "quotes escaped");

console.log("inputSanitization validation tests passed ✓");