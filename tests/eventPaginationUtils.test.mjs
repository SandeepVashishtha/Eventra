import assert from "node:assert/strict";
import {
  DEFAULT_EVENTS_PER_PAGE,
  EVENTS_PER_PAGE_OPTIONS,
  clampPage,
  filterEventsByType,
  getPaginatedEvents,
  getTotalPages,
  getVisiblePaginationPages,
  sortEventsByDate,
} from "../src/Pages/Events/eventPaginationUtils.mjs";

const sampleEvents = [
  {
    id: 1,
    title: "React Workshop",
    status: "upcoming",
    type: "workshop",
    date: "2026-06-10",
  },
  {
    id: 2,
    title: "AI Conference",
    status: "upcoming",
    type: "conference",
    date: "2026-05-01",
  },
  {
    id: 3,
    title: "Past Meetup",
    status: "past",
    type: "meetup",
    date: "2025-09-15",
  },
  {
    id: 4,
    title: "Cloud Workshop",
    status: "past",
    type: "workshop",
    date: "2025-02-20",
  },
];

const makeEvents = (count) =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Event ${index + 1}`,
    status: index % 2 === 0 ? "upcoming" : "past",
    type: index % 3 === 0 ? "conference" : "workshop",
    date: `2026-01-${String((index % 28) + 1).padStart(2, "0")}`,
  }));

assert.equal(DEFAULT_EVENTS_PER_PAGE, 6);
assert.deepEqual(EVENTS_PER_PAGE_OPTIONS, [6, 9, 12]);

assert.equal(getTotalPages(0, 6), 1, "empty lists still expose one safe page");
assert.equal(getTotalPages(6, 6), 1, "exact page size fits on one page");
assert.equal(getTotalPages(7, 6), 2, "overflow creates another page");
assert.equal(getTotalPages(120, 12), 10, "large lists scale by page size");

assert.equal(clampPage(-2, 5), 1, "negative pages clamp to first page");
assert.equal(clampPage(0, 5), 1, "page zero clamps to first page");
assert.equal(clampPage(3, 5), 3, "valid pages pass through");
assert.equal(clampPage(8, 5), 5, "over-large pages clamp to last page");

const thirteenEvents = makeEvents(13);
assert.deepEqual(
  getPaginatedEvents(thirteenEvents, 1, 6).map((event) => event.id),
  [1, 2, 3, 4, 5, 6],
  "first page returns the first batch only"
);
assert.deepEqual(
  getPaginatedEvents(thirteenEvents, 2, 6).map((event) => event.id),
  [7, 8, 9, 10, 11, 12],
  "middle page returns the next batch"
);
assert.deepEqual(
  getPaginatedEvents(thirteenEvents, 3, 6).map((event) => event.id),
  [13],
  "last page returns a partial batch without over-reading"
);
assert.deepEqual(
  getPaginatedEvents(thirteenEvents, 2, 9).map((event) => event.id),
  [10, 11, 12, 13],
  "changing page size updates the slice window"
);

assert.deepEqual(
  getVisiblePaginationPages(1, 10),
  { firstVisiblePage: 1, lastVisiblePage: 3, pages: [1, 2, 3] },
  "pagination window is compact at the beginning"
);
assert.deepEqual(
  getVisiblePaginationPages(5, 10),
  { firstVisiblePage: 3, lastVisiblePage: 7, pages: [3, 4, 5, 6, 7] },
  "pagination window stays compact in the middle"
);
assert.deepEqual(
  getVisiblePaginationPages(10, 10),
  { firstVisiblePage: 8, lastVisiblePage: 10, pages: [8, 9, 10] },
  "pagination window is compact at the end"
);
assert.deepEqual(
  getVisiblePaginationPages(1, 1),
  { firstVisiblePage: 1, lastVisiblePage: 1, pages: [1] },
  "single-page lists render one active page"
);

assert.deepEqual(
  filterEventsByType(sampleEvents, "all").map((event) => event.id),
  [1, 2, 3, 4],
  "all filter preserves all events"
);
assert.deepEqual(
  filterEventsByType(sampleEvents, "upcoming").map((event) => event.id),
  [1, 2],
  "upcoming filter uses status"
);
assert.deepEqual(
  filterEventsByType(sampleEvents, "past").map((event) => event.id),
  [3, 4],
  "past filter uses status"
);
assert.deepEqual(
  filterEventsByType(sampleEvents, "workshop").map((event) => event.id),
  [1, 4],
  "type filters still work with pagination"
);
assert.deepEqual(
  filterEventsByType(sampleEvents, "webinar").map((event) => event.id),
  [],
  "unknown filters safely return an empty list"
);

assert.deepEqual(
  sortEventsByDate(sampleEvents, "Newest").map((event) => event.id),
  [1, 2, 3, 4],
  "newest sort puts latest dates first"
);
assert.deepEqual(
  sortEventsByDate(sampleEvents, "Upcoming").map((event) => event.id),
  [4, 3, 2, 1],
  "upcoming sort puts earliest dates first"
);
assert.deepEqual(
  sampleEvents.map((event) => event.id),
  [1, 2, 3, 4],
  "sorting does not mutate the source array"
);

const filteredSorted = sortEventsByDate(
  filterEventsByType(sampleEvents, "workshop"),
  "Upcoming"
);
assert.deepEqual(
  getPaginatedEvents(filteredSorted, 1, 1).map((event) => event.id),
  [4],
  "filter, sort, and pagination compose correctly"
);

// Clamp tests with float / string conversions
assert.equal(clampPage("3", 5), 3, "stringified numbers are coerced and clamped");
assert.equal(clampPage(2.5, 5), 2.5, "float values pass through clamp correctly");

// Sorting events with duplicate dates
const eventsWithDuplicateDates = [
  { id: 1, title: "A", date: "2026-06-01" },
  { id: 2, title: "B", date: "2026-06-01" },
];
assert.deepEqual(
  sortEventsByDate(eventsWithDuplicateDates, "Newest").map(e => e.id),
  [1, 2],
  "newest sort maintains stable sorting on duplicate dates"
);

if (process.env.NODE_ENV === "development" || true) {
 console.log("event pagination edge cases passed");
}
