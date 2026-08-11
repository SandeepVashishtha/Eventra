import assert from "node:assert/strict";

import {
  clampPage,
  getTotalPages,
  sortEventsByDate,
} from "../src/Pages/Events/eventPaginationUtils.mjs";

const tiedEvents = [
  { id: 1, title: "First", date: "2026-03-01" },
  { id: 2, title: "Second", date: "2026-03-01" },
  { id: 3, title: "Third", date: "2026-02-01" },
];

const newest = sortEventsByDate(tiedEvents, "Newest");
assert.deepEqual(
  newest.map((event) => event.id),
  [1, 2, 3],
  "equal dates preserve input order for stable newest sorting",
);

const upcoming = sortEventsByDate(tiedEvents, "Upcoming");
assert.deepEqual(
  upcoming.map((event) => event.id),
  [3, 1, 2],
  "equal dates preserve input order for stable upcoming sorting",
);

assert.equal(clampPage("3", "5"), 3, "string page values coerce safely");
assert.equal(getTotalPages("13", "6"), 3, "string totals coerce during pagination math");

console.log("eventPaginationUtils edge-case tests passed ✓");
