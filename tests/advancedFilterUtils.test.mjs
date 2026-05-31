import assert from "node:assert/strict";
import {
  applyAdvancedFilters,
  decodeAdvancedFilters,
  encodeAdvancedFilters,
  filterByCategory,
  filterByLocation,
  filterByMode,
  filterByPrice,
  filterByStatus,
  getUniqueCategories,
  getPriceStats,
  hasActiveFilters,
  normalizeAdvancedFilters,
  getDefaultFilters
} from "../src/utils/advancedFilterUtils.js";

const events = [
  { id: 1, title: "Web Dev", category: "Web Development", eventMode: "online", price: 0, status: "live", date: "2026-05-28", location: "Online" },
  { id: 2, title: "AI Summit", category: "AI & Machine Learning", eventMode: "offline", price: 100, status: "upcoming", date: "2026-06-15", location: "Delhi" }
];

assert.equal(filterByCategory(events, ["web-development"]).length, 1);
assert.equal(filterByCategory(events, ["ai-ml"]).length, 1);
assert.equal(filterByMode(events, ["online"]).length, 1);
assert.equal(filterByLocation(events, "del").length, 1);
assert.equal(filterByPrice(events, { min: 0, max: 50 }).length, 1);
assert.equal(filterByStatus(events, ["live"]).length, 1);
assert.deepEqual(
  applyAdvancedFilters(events, {
    categories: ["ai-ml"],
    modes: ["offline"],
    location: "delhi",
    priceRange: { min: 50, max: 150 },
    statuses: ["upcoming"],
  }).map((event) => event.id),
  [2]
);

const unique = getUniqueCategories(events);
assert.deepEqual(unique, ["AI & Machine Learning", "Web Development"]);

const stats = getPriceStats(events);
assert.equal(stats.min, 0);
assert.equal(stats.max, 100);

assert.equal(!!hasActiveFilters({ categories: ["ai"] }), true);
assert.equal(!!hasActiveFilters({ location: "Delhi" }), true);
assert.equal(!!hasActiveFilters(getDefaultFilters()), false);

const normalized = normalizeAdvancedFilters({
  categories: "bad",
  location: "Delhi",
  dateRange: { startDate: "2026-06-01T00:00:00.000Z" }
});
assert.deepEqual(normalized.categories, []);
assert.equal(normalized.dateRange.startDate, "2026-06-01");

const encoded = encodeAdvancedFilters({
  modes: ["online"],
  location: "Remote"
});
assert.deepEqual(decodeAdvancedFilters(encoded).modes, ["online"]);
assert.equal(decodeAdvancedFilters(encoded).location, "Remote");

console.log("advancedFilterUtils tests passed ✓");
