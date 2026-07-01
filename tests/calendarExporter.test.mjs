import assert from "node:assert/strict";

globalThis.document = {
  createElement: () => ({
    setAttribute: () => {},
    style: {},
    click: () => {}
  }),
  body: {
    appendChild: () => {},
    contains: () => true,
    removeChild: () => {}
  }
};
globalThis.URL = {
  createObjectURL: () => "blob:url",
  revokeObjectURL: () => {}
};
globalThis.Blob = class {};

import { generateGoogleCalendarLink, generateOutlookLink } from "../src/utils/calendarExporter.js";

const event = {
  title: "GSSoC Meetup",
  description: "Networking",
  date: "2026-05-28",
  location: "Zoom"
};

const gLink = generateGoogleCalendarLink(event);
assert.ok(gLink.includes("GSSoC+Meetup"));

const oLink = generateOutlookLink(event);
assert.ok(oLink.includes("GSSoC+Meetup"));

console.log("calendarExporter tests passed ✓");
