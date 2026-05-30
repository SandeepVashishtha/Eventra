import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;

const { sanitizeHtml, sanitizeMarkdown } = await import("../src/utils/sanitizeHtml.js");

assert.equal(sanitizeHtml(null), "", "null input returns empty string");
assert.equal(sanitizeHtml(42), "", "non-string input returns empty string");
assert.equal(sanitizeHtml(""), "", "empty string stays empty");

const safeHtml = sanitizeHtml('<p>Hello</p><script>alert(1)</script>');
assert.match(safeHtml, /Hello/);
assert.doesNotMatch(safeHtml, /<script/i, "strips script tags");

const safeLink = sanitizeHtml('<a href="javascript:alert(1)">Click</a>');
assert.doesNotMatch(safeLink, /javascript:/i, "neutralizes javascript: links");

const safeImage = sanitizeHtml('<img src="x" onerror="alert(1)" />');
assert.doesNotMatch(safeImage, /onerror/i, "strips inline event handlers");

const markdownHtml = sanitizeMarkdown("**bold**", (markdown) => `<p>${markdown}</p>`);
assert.match(markdownHtml, /bold/);
assert.doesNotMatch(markdownHtml, /<script/i, "sanitizes parsed markdown output");

assert.equal(
  sanitizeMarkdown("raw", null),
  "raw",
  "falls back to sanitizeHtml when parser is missing",
);

console.log("sanitizeHtml tests passed ✓");
