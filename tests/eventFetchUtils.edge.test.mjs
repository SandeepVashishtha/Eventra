import assert from "node:assert/strict";
import { buildPaginatedUrl, buildPageRangeLabel } from "../src/utils/eventFetchUtils.js";

const url = buildPaginatedUrl("https://api.example.com/events?category=tech", 1, 20);
assert.ok(url.includes("page=1"));
assert.ok(url.includes("size=20"));
assert.ok(url.includes("category=tech"));

const label = buildPageRangeLabel(2, 20, 50);
assert.equal(label, "Showing 21–40 of 50 events");
console.log("eventFetchUtils edge tests passed ✓");
