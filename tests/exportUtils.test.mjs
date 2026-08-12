import assert from "node:assert/strict";

let blobContent = "";
let clicked = false;
let revokedUrl = "";

globalThis.Blob = class {
  constructor(parts) {
    blobContent = parts.join("");
  }
};

globalThis.window = {};

globalThis.URL = {
  createObjectURL() {
    return "blob:csv";
  },
  revokeObjectURL(url) {
    revokedUrl = url;
  },
};

globalThis.setTimeout = (callback) => {
  callback();
};

globalThis.document = {
  body: {
    appendChild() {},
    removeChild() {},
  },
  createElement() {
    return {
      href: "",
      style: {},
      setAttribute(key, value) {
        this[key] = value;
      },
      click() {
        clicked = true;
      },
    };
  },
};

const { sanitizeFilename, exportToCSV } = await import("../src/utils/exportUtils.js");

assert.equal(sanitizeFilename("GSSoC Eventra Report!"), "gssoc_eventra_report_");

exportToCSV([
  {
    name: '=HYPERLINK("http://evil.com","click")',
    email: '+user"quote@example.com',
    date: "-2026-05-26",
    ticketType: "@VIP",
  },
  {
    name: "\tTabbed Name",
    email: "\rreturn@example.com",
    date: "2026-05-26",
    ticketType: "General",
  },
]);

assert.equal(clicked, true);
assert.equal(revokedUrl, "blob:csv");
assert.ok(blobContent.includes(`"'=HYPERLINK(""http://evil.com"",""click"")"`));
assert.ok(blobContent.includes(`"'+user""quote@example.com"`));
assert.ok(blobContent.includes(`"'-2026-05-26"`));
assert.ok(blobContent.includes(`"'@VIP"`));
assert.ok(blobContent.includes(`"'\tTabbed Name"`));
assert.ok(blobContent.includes(`"'\rreturn@example.com"`));

console.log("exportUtils tests passed ✓");
