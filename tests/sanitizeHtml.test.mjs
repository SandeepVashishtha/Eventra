import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM("");
global.window = dom.window;
global.document = dom.window.document;

// Import the sanitizeHtml functions now that global window/document exist
const { sanitizeHtml, sanitizeMarkdown } = await import("../src/utils/sanitizeHtml.js");

try {
  // Test Case 1: Simple text inputs
  assert.equal(sanitizeHtml(null), "", "null input should return empty string");
  assert.equal(sanitizeHtml(""), "", "empty string should return empty string");
  assert.equal(sanitizeHtml(123), "", "non-string input should return empty string");

  // Test Case 2: Strip XSS script and style tags
  const dirtyHtml = "<div>Hello <script>alert('xss')</script><style>body {background: red;}</style>World</div>";
  const cleanHtml = sanitizeHtml(dirtyHtml);
  assert.equal(cleanHtml, "<div>Hello World</div>", "Should strip script and style tags");

  // Test Case 3: Whitelisted tags and attributes
  const goodHtml = '<p class="text-large"><a href="https://example.com" target="_blank">Link</a></p>';
  const expectedHtml = '<p class="text-large"><a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a></p>';
  const outputHtml = sanitizeHtml(goodHtml);
  assert.equal(outputHtml, expectedHtml, "Should retain whitelisted tags (p, a) and attributes (class, href, target) and append security rel attributes");

  // Test Case 4: Strip illegal attributes
  const badAttrHtml = '<div data-secret="123" onclick="doMalicious()">Click Me</div>';
  const cleanAttrHtml = sanitizeHtml(badAttrHtml);
  assert.equal(cleanAttrHtml, "<div>Click Me</div>", "Should strip custom data-attributes and onclick event handlers");

  // Test Case 5: sanitizeMarkdown simple pass-through without markdown parser
  assert.equal(sanitizeMarkdown(null), "", "Null markdown returns empty string");
  assert.equal(sanitizeMarkdown("### Title"), "### Title", "Should fall back to sanitizeHtml when no markdown parser is provided");

  // Test Case 6: sanitizeMarkdown with mock markdown parser
  const mockParser = (md) => {
    if (md === "# Hello") return "<h1>Hello</h1>";
    if (md === "# Hello <script>alert(1)</script>") return "<h1>Hello <script>alert(1)</script></h1>";
    return md;
  };
  
  assert.equal(sanitizeMarkdown("# Hello", mockParser), "<h1>Hello</h1>", "Should sanitize parsed markdown HTML");
  assert.equal(sanitizeMarkdown("# Hello <script>alert(1)</script>", mockParser), "<h1>Hello </h1>", "Should sanitize and strip script from parsed markdown HTML");

  console.log("sanitizeHtml and sanitizeMarkdown tests passed ✓");
} finally {
  delete global.window;
  delete global.document;
}
