import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// Setup JSDOM environment
const dom = new JSDOM("");
global.window = dom.window;
global.document = dom.window.document;
global.location = { hostname: "eventra.dev" };

// Import all functions from the updated sanitizeHtml.js
const {
  sanitizeHtml,
  sanitizeMarkdown,
  sanitizeUrl,
  stripHtml,
  sanitizeObject,
  SANITIZE_PROFILES,
  ALLOWED_URI_REGEXP,
} = await import("../src/utils/sanitizeHtml.js");

// Cleanup function
const cleanup = () => {
  delete global.window;
  delete global.document;
  delete global.location;
};

try {
  // ========================================================================
  // sanitizeHtml - Backward Compatibility Tests
  // ========================================================================
  
  assert.equal(sanitizeHtml(null), "", "null input should return empty string");
  assert.equal(sanitizeHtml(""), "", "empty string should return empty string");
  assert.equal(sanitizeHtml(123), "", "non-string input should return empty string");

  const dirtyHtml = "<div>Hello <script>alert('xss')</script><style>body {background: red;}</style>World</div>";
  const cleanHtml = sanitizeHtml(dirtyHtml);
  assert.ok(!cleanHtml.includes("<script>"), "Should strip script tags");
  assert.ok(!cleanHtml.includes("<style>"), "Should strip style tags");
  assert.ok(cleanHtml.includes("Hello"), "Should preserve text content - Hello");
  assert.ok(cleanHtml.includes("World"), "Should preserve text content - World");

  const goodHtml = '<p class="text-large"><a href="https://example.com" target="_blank">Link</a></p>';
  const outputHtml = sanitizeHtml(goodHtml);
  assert.ok(outputHtml.includes("<p"), "Should retain p tag");
  assert.ok(outputHtml.includes("<a"), "Should retain a tag");
  assert.ok(outputHtml.includes('rel="noopener noreferrer"'), "Should add security rel attribute");

  const badAttrHtml = '<div data-secret="123" onclick="doMalicious()">Click Me</div>';
  const cleanAttrHtml = sanitizeHtml(badAttrHtml);
  assert.ok(!cleanAttrHtml.includes("data-secret"), "Should strip data-attributes");
  assert.ok(!cleanAttrHtml.includes("onclick"), "Should strip event handlers");
  assert.ok(cleanAttrHtml.includes("Click Me"), "Should preserve text content");

  const maliciousUrls = '<a href="javascript:alert(1)">Link</a>';
  const cleanMalicious = sanitizeHtml(maliciousUrls);
  assert.ok(!cleanMalicious.includes("javascript:"), "Should strip javascript: protocols");

  // ========================================================================
  // sanitizeMarkdown - Backward Compatibility Tests
  // ========================================================================
  
  assert.equal(sanitizeMarkdown(null), "", "Null markdown returns empty string");
  assert.equal(sanitizeMarkdown("### Title"), "### Title", "Should fall back to sanitizeHtml");

  const mockParser = (md) => {
    if (md === "# Hello") return "<h1>Hello</h1>";
    if (md === "# Hello <script>alert(1)</script>") return "<h1>Hello <script>alert(1)</script></h1>";
    return md;
  };
  
  assert.equal(sanitizeMarkdown("# Hello", mockParser), "<h1>Hello</h1>", "Should sanitize parsed markdown");
  assert.ok(!sanitizeMarkdown("# Hello <script>alert(1)</script>", mockParser).includes("<script>"), "Should strip scripts from markdown");

  // ========================================================================
  // SANITIZE_PROFILES Tests
  // ========================================================================
  
  assert.ok(SANITIZE_PROFILES.RICH_TEXT, "RICH_TEXT profile should exist");
  assert.ok(SANITIZE_PROFILES.RICH_TEXT.ALLOWED_TAGS.includes("p"), "RICH_TEXT should allow p tags");
  assert.ok(SANITIZE_PROFILES.RICH_TEXT.ALLOWED_TAGS.includes("table"), "RICH_TEXT should allow table tags");

  assert.ok(SANITIZE_PROFILES.INLINE_ONLY, "INLINE_ONLY profile should exist");
  assert.ok(SANITIZE_PROFILES.INLINE_ONLY.ALLOWED_TAGS.includes("b"), "INLINE_ONLY should allow b tags");
  assert.ok(!SANITIZE_PROFILES.INLINE_ONLY.ALLOWED_TAGS.includes("table"), "INLINE_ONLY should not allow table tags");

  assert.ok(SANITIZE_PROFILES.PLAIN_TEXT, "PLAIN_TEXT profile should exist");
  assert.equal(SANITIZE_PROFILES.PLAIN_TEXT.ALLOWED_TAGS.length, 0, "PLAIN_TEXT should have no allowed tags");

  // ========================================================================
  // sanitizeHtml with Profiles Tests
  // ========================================================================
  
  const htmlWithTable = "<p>Test <table><tr><td>content</td></tr></table></p>";
  const resultWithTable = sanitizeHtml(htmlWithTable);
  assert.ok(resultWithTable.includes("<table>"), "Default profile should allow tables");

  const htmlWithInline = "<p>Test <b>bold</b> <table>table</table></p>";
  const resultWithInline = sanitizeHtml(htmlWithInline, { profile: "INLINE_ONLY" });
  assert.ok(resultWithInline.includes("<b>"), "INLINE_ONLY should allow b tags");
  assert.ok(!resultWithInline.includes("<table>"), "INLINE_ONLY should not allow table tags");

  const htmlPlainText = "<p>Test <b>bold</b></p>";
  const resultPlainText = sanitizeHtml(htmlPlainText, { profile: "PLAIN_TEXT" });
  assert.ok(!resultPlainText.includes("<p>"), "PLAIN_TEXT should strip p tags");
  assert.ok(!resultPlainText.includes("<b>"), "PLAIN_TEXT should strip b tags");
  assert.ok(resultPlainText.includes("Test bold"), "PLAIN_TEXT should preserve text");

  // ========================================================================
  // stripHtml Tests
  // ========================================================================
  
  assert.equal(stripHtml(null), "", "null should return empty string");
  assert.equal(stripHtml(123), "", "number should return empty string");
  assert.equal(stripHtml(""), "", "empty string should return empty string");

  const htmlWithTags = "<p>Hello <b>World</b> <script>alert('xss')</script></p>";
  const resultNoTags = stripHtml(htmlWithTags);
  assert.ok(!resultNoTags.includes("<p>"), "Should remove p tag");
  assert.ok(!resultNoTags.includes("<b>"), "Should remove b tag");
  assert.ok(!resultNoTags.includes("<script>"), "Should remove script tag");
  assert.equal(resultNoTags, "Hello World alert('xss')", "Should preserve text content");

  const htmlWithEntities = "Hello &amp; World &lt;test&gt; &quot;quoted&quot;";
  const resultEntities = stripHtml(htmlWithEntities);
  assert.ok(resultEntities.includes("&"), "Should decode &amp; to &");
  assert.ok(resultEntities.includes("<test>"), "Should decode &lt; and &gt;");
  assert.ok(resultEntities.includes('"quoted"'), "Should decode &quot;");

  const htmlWithNumericEntities = "Hello &#8211; dash &#8212; mdash";
  const resultNumeric = stripHtml(htmlWithNumericEntities);
  // Note: &#8211; is en dash (–) and &#8212; is em dash (—)
  assert.ok(resultNumeric.includes("-") || resultNumeric.includes("–"), "Should decode en dash");
  assert.ok(resultNumeric.includes("—"), "Should decode em dash");

  const htmlWithHexEntities = "Hello &#x26; ampersand";
  const resultHex = stripHtml(htmlWithHexEntities);
  assert.ok(resultHex.includes("&"), "Should decode hex entity");

  const htmlNested2 = "<div><p><span>Nested <b>text</b></span></p></div>";
  const resultNested3 = stripHtml(htmlNested2);
  assert.equal(resultNested3, "Nested text", "Should handle nested tags correctly");

  // ========================================================================
  // sanitizeUrl Tests
  // ========================================================================
  
  assert.equal(sanitizeUrl(null), "#", "null should return fallback");
  assert.equal(sanitizeUrl(123), "#", "number should return fallback");
  assert.equal(sanitizeUrl(""), "#", "empty string should return fallback");

  assert.equal(sanitizeUrl("https://example.com"), "https://example.com", "Should allow https");
  assert.equal(sanitizeUrl("http://example.com"), "http://example.com", "Should allow http");
  assert.equal(sanitizeUrl("mailto:test@example.com"), "mailto:test@example.com", "Should allow mailto");
  assert.equal(sanitizeUrl("tel:+1234567890"), "tel:+1234567890", "Should allow tel");
  assert.equal(sanitizeUrl("ftp://example.com"), "ftp://example.com", "Should allow ftp");

  assert.equal(sanitizeUrl("javascript:alert(1)"), "#", "Should block javascript: protocol");
  assert.equal(sanitizeUrl("data:text/html,<script>alert(1)</script>"), "#", "Should block unsafe data: protocol");

  const safeDataUri = "data:image/png;base64,SGVsbG8gV29ybGQ=";
  assert.equal(sanitizeUrl(safeDataUri), safeDataUri, "Should allow safe image data URIs");

  assert.equal(sanitizeUrl("vbscript:msgbox('xss')"), "#", "Should block vbscript: protocol");
  assert.equal(sanitizeUrl("file:///etc/passwd"), "#", "Should block file: protocol");

  assert.equal(sanitizeUrl("/path/to/page"), "/path/to/page", "Should allow relative paths");
  assert.equal(sanitizeUrl("./relative"), "./relative", "Should allow relative paths");
  assert.equal(sanitizeUrl("../parent"), "../parent", "Should allow parent paths");

  assert.equal(sanitizeUrl("#section"), "#section", "Should allow anchor links");

  assert.equal(sanitizeUrl("javascript:alert(1)", "about:blank"), "about:blank", "Should use custom fallback");

  assert.equal(sanitizeUrl("  https://example.com  "), "https://example.com", "Should trim whitespace");

  // ========================================================================
  // sanitizeObject Tests
  // ========================================================================
  
  assert.equal(sanitizeObject(null), null, "Should handle null");
  assert.equal(sanitizeObject(undefined), undefined, "Should handle undefined");

  const objWithXSS = { name: "<script>alert('xss')</script>Test" };
  const resultObj = sanitizeObject(objWithXSS);
  assert.ok(!resultObj.name.includes("<script>"), "Should sanitize string values");
  assert.ok(resultObj.name.includes("Test"), "Should preserve safe content");

  const nestedObj2 = {
    user: {
      name: "<script>alert('xss')</script>John",
      bio: "<script>alert('xss')</script>Safe bio"
    }
  };
  const resultNested2 = sanitizeObject(nestedObj2);
  assert.ok(!resultNested2.user.name.includes("<script>"), "Should sanitize nested object strings");
  assert.ok(!resultNested2.user.bio.includes("<script>"), "Should sanitize nested bio");
  assert.ok(resultNested2.user.name.includes("John"), "Should preserve nested content");

  const objWithArray = {
    tags: ["<script>bad</script>Good", "<script>alert(1)</script>Tag"]
  };
  const resultArray = sanitizeObject(objWithArray);
  assert.ok(!resultArray.tags[0].includes("<script>"), "Should sanitize array items");
  assert.ok(!resultArray.tags[1].includes("<script>"), "Should sanitize array items");
  assert.ok(resultArray.tags[0].includes("Good"), "Should preserve array content");

  const deeplyNested = {
    level1: {
      level2: {
        level3: [
          { text: "<script>nested</script>Content" },
          { text: "<script>alert(1)</script>paragraph" }
        ]
      }
    }
  };
  const resultDeep = sanitizeObject(deeplyNested);
  assert.ok(!resultDeep.level1.level2.level3[0].text.includes("<script>"), "Should sanitize deeply nested strings");
  assert.ok(!resultDeep.level1.level2.level3[1].text.includes("<script>"), "Should sanitize deeply nested scripts");

  const objWithPrimitives = {
    num: 42,
    bool: true,
    date: new Date("2024-01-01"),
    nullVal: null,
    undefinedVal: undefined
  };
  const resultPrimitives = sanitizeObject(objWithPrimitives);
  assert.equal(resultPrimitives.num, 42, "Should preserve numbers");
  assert.equal(resultPrimitives.bool, true, "Should preserve booleans");
  assert.ok(resultPrimitives.date instanceof Date, "Should preserve Date objects");
  assert.equal(resultPrimitives.nullVal, null, "Should preserve null");
  assert.equal(resultPrimitives.undefinedVal, undefined, "Should preserve undefined");

  const customSanitizer = (text) => text ? text.toUpperCase() : "";
  const objForCustom = { name: "test" };
  const resultCustom = sanitizeObject(objForCustom, { sanitizer: customSanitizer });
  assert.equal(resultCustom.name, "TEST", "Should use custom sanitizer");

  const objWithProfile = { html: "<p><b>Test</b></p>" };
  const resultProfile = sanitizeObject(objWithProfile, { profile: "PLAIN_TEXT" });
  assert.ok(!resultProfile.html.includes("<p>"), "Should use PLAIN_TEXT profile");
  assert.ok(!resultProfile.html.includes("<b>"), "Should strip all HTML with PLAIN_TEXT");

  // ========================================================================
  // ALLOWED_URI_REGEXP Tests
  // ========================================================================
  
  assert.ok(ALLOWED_URI_REGEXP.test("http://example.com"), "Should match http");
  assert.ok(ALLOWED_URI_REGEXP.test("https://example.com"), "Should match https");
  assert.ok(ALLOWED_URI_REGEXP.test("mailto:test@example.com"), "Should match mailto");
  assert.ok(ALLOWED_URI_REGEXP.test("tel:+1234567890"), "Should match tel");
  assert.ok(ALLOWED_URI_REGEXP.test("ftp://example.com"), "Should match ftp");

  assert.ok(!ALLOWED_URI_REGEXP.test("javascript:alert(1)"), "Should not match javascript");
  assert.ok(!ALLOWED_URI_REGEXP.test("data:text/html"), "Should not match data");
  assert.ok(!ALLOWED_URI_REGEXP.test("file:///path"), "Should not match file");

  // ========================================================================
  // Link Security Hook - External Links Tests
  // ========================================================================
  
  const htmlExternal = '<a href="https://external.com" target="_blank">External Link</a>';
  const resultExternal = sanitizeHtml(htmlExternal);
  assert.ok(resultExternal.includes('rel="noopener noreferrer"'), "Should add security rel to external links");
  assert.ok(resultExternal.includes('target="_blank"'), "Should preserve target attribute");

  const htmlInternal = '<a href="/internal-page">Internal Link</a>';
  const resultInternal = sanitizeHtml(htmlInternal);
  assert.ok(resultInternal.includes("/internal-page"), "Should preserve internal link");

  console.log("All sanitizeUtils tests passed! ✓");
  
} catch (error) {
  console.error("Test failed:", error);
  process.exit(1);
} finally {
  cleanup();
}
