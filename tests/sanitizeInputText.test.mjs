import assert from "node:assert/strict";

const { sanitizeInputText } = await import("../src/utils/inputSanitization.js");

assert.equal(sanitizeInputText(""), "");
assert.equal(sanitizeInputText(null), "");
assert.equal(
  sanitizeInputText("<img src=x onerror=alert(1)>"),
  "&lt;img src=x onerror=alert(1)&gt;"
);
assert.equal(sanitizeInputText("Tom & Jerry"), "Tom &amp; Jerry");
assert.equal(sanitizeInputText(`Say "hello"`), "Say &quot;hello&quot;");
assert.equal(sanitizeInputText("path/to/file"), "path&#x2F;to&#x2F;file");

console.log("sanitizeInputText tests passed ✓");
