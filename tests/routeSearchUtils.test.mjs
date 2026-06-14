import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { getRouteSearchResults } from "../src/utils/searchUtils.mjs";

const require = createRequire(import.meta.url);
const events = require("../src/Pages/Events/eventsMockData.json");
const hackathons = require("../src/Pages/Hackathons/hackathonMockData.json");

const eventKeys = ["title", "description", "location", "tags", "type", "date", "status"];
const hackathonKeys = [
  "title",
  "description",
  "location",
  "techStack",
  "organizer",
  "difficulty",
  "status",
  "startDate",
  "endDate",
];

assert.deepEqual(
  getRouteSearchResults(events, "Cloud Native Conference", eventKeys, {
    threshold: 0.35,
  }).map((event) => event.title),
  ["Cloud Native Conference"],
  "event route search finds the selected homepage suggestion"
);

assert.ok(
  getRouteSearchResults(hackathons, "Hackathon 2025", hackathonKeys).some(
    (hackathon) => hackathon.title === "Blockchain Hackathon"
  ),
  "hackathon route search handles title plus year query params"
);

assert.deepEqual(
  getRouteSearchResults(events, "", eventKeys).map((event) => event.id),
  events.map((event) => event.id),
  "empty route search returns the full listing"
);
// Edge Case: Empty list of items
assert.deepEqual(getRouteSearchResults([], "test", eventKeys), [], "empty list returns empty results");

// Edge Case: Records with missing search fields
const partiallyEmptyRecords = [
  { id: 1, title: "Nextjs Bootcamp" },
  { id: 2 },
];
assert.deepEqual(
  getRouteSearchResults(partiallyEmptyRecords, "Nextjs", eventKeys).map(r => r.id),
  [1],
  "handles records missing target search keys gracefully"
);

// Edge Case: Handling null/undefined arguments
assert.throws(() => {
  getRouteSearchResults(null, "Nextjs", eventKeys);
}, TypeError);
assert.deepEqual(getRouteSearchResults(events, null, eventKeys).map(e => e.id), events.map(e => e.id), "null query returns all events");

if (process.env.NODE_ENV === "development" || true) {
 console.log("route search query matching passed");
}
