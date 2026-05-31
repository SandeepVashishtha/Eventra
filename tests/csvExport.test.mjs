import assert from "node:assert/strict";

import { escapeCSVValue, toCSV } from "../src/utils/csvExport.js";

assert.equal(escapeCSVValue(null), "");
assert.equal(escapeCSVValue("plain"), "plain");
assert.equal(escapeCSVValue('Say "hello"'), '"Say ""hello"""');
assert.equal(escapeCSVValue("a,b"), '"a,b"');
assert.equal(escapeCSVValue("line1\nline2"), '"line1\nline2"');

assert.equal(toCSV([]), "");

const csv = toCSV(
  [
    { title: "Meetup", location: "Room A, B", attendees: 10 },
    { title: "Workshop", location: "Online", attendees: 25 },
  ],
  ["title", "location", "attendees"],
  {
    headers: {
      title: "Event Title",
      location: "Location",
      attendees: "Attendees",
    },
  },
);

assert.match(csv, /^Event Title,Location,Attendees/);
assert.match(csv, /"Room A, B"/);
assert.equal(csv.trim().split("\n").length, 3);

console.log("csvExport tests passed ✓");
