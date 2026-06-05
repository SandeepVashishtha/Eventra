import assert from "node:assert/strict";
import { exportEventsToCSV } from "../src/utils/exportCsv.js";

let clicked = false;
let createdUrl = null;
let revokedUrl = null;
let documentBodyAppended = false;

globalThis.Blob = class {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};

globalThis.window = {
  URL: {
    createObjectURL(blob) {
      createdUrl = "blob://mock-url";
      return createdUrl;
    },
    revokeObjectURL(url) {
      revokedUrl = url;
    }
  }
};

globalThis.document = {
  createElement(tag) {
    return {
      href: "",
      setAttribute(name, val) {},
      click() { clicked = true; }
    };
  },
  body: {
    appendChild(el) { documentBodyAppended = true; },
    removeChild(el) {}
  }
};

const events = [{ id: 1, title: "Test Event" }];
exportEventsToCSV(events, "test.csv");

assert.equal(clicked, true);
assert.equal(createdUrl, "blob://mock-url");
assert.equal(revokedUrl, "blob://mock-url");
assert.equal(documentBodyAppended, true);

console.log("exportCsv edge tests passed ✓");
