import assert from "node:assert/strict";
import { sanitizeInputText } from "../src/utils/inputSanitization.js";

assert.equal(sanitizeInputText(null), "", "null input returns empty string");
assert.equal(sanitizeInputText(undefined), "", "undefined input returns empty string");
assert.equal(sanitizeInputText(""), "", "empty string returns empty string");

assert.equal(sanitizeInputText("plain text"), "plain text", "text without special chars unchanged");
assert.equal(sanitizeInputText("hello world 123"), "hello world 123", "alphanumeric text unchanged");
assert.equal(sanitizeInputText("Hello World"), "Hello World", "mixed case text unchanged");

assert.equal(sanitizeInputText("&amp;"), "&amp;amp;", "ampersand escaped");
assert.equal(sanitizeInputText("<tag>"), "&lt;tag&gt;", "angle brackets escaped");
assert.equal(sanitizeInputText('"quotes"'), "&quot;quotes&quot;", "double quotes escaped");
assert.equal(sanitizeInputText("'single'"), "&#x27;single&#x27;", "single quotes escaped");
assert.equal(sanitizeInputText("/slash/"), "&#x2F;slash&#x2F;", "forward slashes at boundaries escaped");
assert.equal(sanitizeInputText("a/b"), "a&#x2F;b", "forward slash in middle escaped");

const mixed = "Hello & World <tag> \"quoted\" 'single' /slash/";
const sanitized = sanitizeInputText(mixed);
assert.ok(sanitized.includes("Hello"), "Hello preserved");
assert.ok(sanitized.includes("&amp;"), "ampersand escaped");
assert.ok(sanitized.includes("&lt;"), "opening bracket escaped");
assert.ok(sanitized.includes("&gt;"), "closing bracket escaped");
assert.ok(sanitized.includes("&quot;"), "double quotes escaped");
assert.ok(sanitized.includes("&#x27;"), "single quotes escaped");
assert.ok(sanitized.includes("&#x2F;"), "slashes escaped");

const onlySpecial = "&<>\"'/";
const sanitizedOnly = sanitizeInputText(onlySpecial);
assert.ok(sanitizedOnly.includes("&amp;"), "ampersand replaced with &amp; entity");
assert.ok(sanitizedOnly.includes("&lt;"), "less-than replaced with &lt; entity");
assert.ok(sanitizedOnly.includes("&gt;"), "greater-than replaced with &gt; entity");

assert.equal(sanitizeInputText("test with spaces"), "test with spaces", "spaces preserved");
assert.equal(sanitizeInputText("newlines\nhere"), "newlines\nhere", "newlines not escaped (function only escapes &<>\"/')");
assert.equal(sanitizeInputText("tabs\there"), "tabs\there", "tabs not escaped (function only escapes &<>\"/')");

console.log("All sanitizeInputText tests passed!");