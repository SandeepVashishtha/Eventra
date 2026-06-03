import assert from "node:assert/strict";

let blobContent = "";
let clicked = false;
let revokedUrl = "";

globalThis.Blob = class {
  constructor(parts) {
    blobContent = parts.join("");
  }
};

globalThis.window = {
  URL: {
    createObjectURL() {
      return "blob:csv";
    },
    revokeObjectURL(url) {
      revokedUrl = url;
    },
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
      setAttribute(key, value) {
        this[key] = value;
      },
      click() {
        clicked = true;
      },
    };
  },
};

const { exportAttendeesToCSV, exportEventsToCSV } = await import("../src/utils/exportCsv.js");

exportAttendeesToCSV([
  {
    name: '=HYPERLINK("http://evil.com","click")',
    email: '+user"quote@example.com',
    registrationDate: "-2026-05-26",
    ticketType: "@VIP",
  },
  {
    name: "\tTabbed Name",
    email: "\rreturn@example.com",
    registrationDate: "2026-05-26",
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

// Edge Case: Empty list of attendees should return early without triggering download
let clickedEmpty = false;
const originalClick = globalThis.document.createElement;
globalThis.document.createElement = () => {
  return {
    href: "",
    setAttribute() {},
    click() {
      clickedEmpty = true;
    },
  };
};

exportAttendeesToCSV([]);
assert.equal(
  clickedEmpty,
  false,
  "export empty attendees list should return early and not trigger download"
);

// Test exportEventsToCSV
clicked = false;
revokedUrl = "";
blobContent = "";

globalThis.document.createElement = originalClick;

exportEventsToCSV([
  {
    id: 1,
    title: '=HYPERLINK("http://evil.com","click")',
    date: "2026-06-01",
    time: "10:00 AM",
    location: "Online",
    type: "Conference",
    status: "active",
    organizer: "GSSoC",
    description: "A secure event.",
  },
]);

assert.equal(clicked, true);
assert.equal(revokedUrl, "blob:csv");
assert.ok(
  blobContent.includes(
    `"id","title","date","time","location","type","status","organizer","description","url"`
  )
);
assert.ok(blobContent.includes(`"1"`));
assert.ok(blobContent.includes(`"'=HYPERLINK(""http://evil.com"",""click"")"`));
assert.ok(blobContent.includes(`"2026-06-01"`));

// Test empty exportEventsToCSV
let clickedEventsEmpty = false;
globalThis.document.createElement = () => {
  return {
    href: "",
    setAttribute() {},
    click() {
      clickedEventsEmpty = true;
    },
  };
};

exportEventsToCSV([]);
assert.equal(
  clickedEventsEmpty,
  false,
  "export empty events list should return early and not trigger download"
);

// Cleanup global mocks
globalThis.document.createElement = originalClick;

console.log("exportCsv tests passed ✓");
