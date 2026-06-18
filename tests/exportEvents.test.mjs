import assert from "node:assert/strict";

global.window = {
  location: { origin: "https://eventra.test" },
};

const { eventsToCSV } = await import("../src/utils/exportEvents.js");

const emptyCsv = eventsToCSV([]);
assert.match(emptyCsv, /^id,title,date/);
assert.equal(emptyCsv.trim().split("\n").length, 1, "empty export keeps header row only");

const csv = eventsToCSV([
  {
    id: 1,
    title: 'Talk "React", tips',
    description: "Line one\nLine two",
    date: "2026-06-01",
    time: "10:00",
    location: "Room A, Building 2",
    type: "Workshop",
    status: "upcoming",
    organizer: "Eventra Team",
  },
]);

assert.match(csv, /"Talk ""React"", tips"/, "commas and quotes are escaped");
assert.match(csv, /"Line one\nLine two"/, "newlines stay inside quoted cells");
assert.match(csv, /"Room A, Building 2"/, "commas in location are escaped");
assert.match(csv, /https:\/\/eventra\.test\/events\/1/, "event URL uses window origin");

delete global.window;

console.log("exportEvents tests passed ✓");
