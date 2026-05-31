import assert from "node:assert/strict";

import { getRouteSearchResults, normalizeSearchText } from "../src/utils/searchUtils.mjs";

assert.equal(normalizeSearchText(null), "");
assert.equal(normalizeSearchText(undefined), "");
assert.equal(normalizeSearchText(["Cloud", "Native"]), "cloud native");

const items = [
  { title: "Café Meetup", description: "networking", location: "Paris" },
  { title: "Rust Workshop", description: "systems", location: "Berlin" },
];

assert.equal(
  getRouteSearchResults(items, "cafe", ["title"]).length,
  1,
  "accent-insensitive route search matches normalized text",
);

assert.deepEqual(
  getRouteSearchResults(items, "   ", ["title", "description"]).map((item) => item.title),
  items.map((item) => item.title),
  "whitespace-only queries return the full listing",
);

assert.deepEqual(
  getRouteSearchResults([], "rust", ["title"]),
  [],
  "empty datasets safely return no matches",
);

console.log("routeSearchUtils edge-case tests passed ✓");
