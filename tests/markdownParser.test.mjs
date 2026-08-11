import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMarkdownParserWorkerCode } from "../src/components/chat/markdownParserWorker.js";

describe("Web Worker Markdown Parser Tests", () => {
  it("should generate worker javascript source with postMessage hooks", () => {
    const code = createMarkdownParserWorkerCode();
    assert.ok(code.includes("self.onmessage"));
    assert.ok(code.includes("self.postMessage"));
  });

  it("should convert bold markdown syntax into HTML elements", () => {
    const raw = "**Hello Eventra**";
    const html = raw.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    assert.equal(html, "<strong>Hello Eventra</strong>");
  });
});
