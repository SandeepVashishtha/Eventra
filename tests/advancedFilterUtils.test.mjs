import assert from "node:assert/strict";
import {
  filterByCategory,
  filterByMode,
  filterByPrice,
  filterByStatus,
  getUniqueCategories,
  getPriceStats,
  hasActiveFilters,
  getDefaultFilters
} from "../src/utils/advancedFilterUtils.js";

const events = [
  { id: 1, title: "Web Dev", category: "Web Development", eventMode: "online", price: 0, status: "live", date: "2026-05-28" },
  { id: 2, title: "AI Summit", category: "AI & Machine Learning", eventMode: "offline", price: 100, status: "upcoming", date: "2026-06-15" }
];

assert.equal(filterByCategory(events, ["web-development"]).length, 1);
assert.equal(filterByMode(events, ["online"]).length, 1);
assert.equal(filterByPrice(events, { min: 0, max: 50 }).length, 1);
assert.equal(filterByStatus(events, ["live"]).length, 1);

const unique = getUniqueCategories(events);
assert.deepEqual(unique, ["AI & Machine Learning", "Web Development"]);

const stats = getPriceStats(events);
assert.equal(stats.min, 0);
assert.equal(stats.max, 100);

assert.equal(!!hasActiveFilters({ categories: ["ai"] }), true);
assert.equal(!!hasActiveFilters(getDefaultFilters()), false);

console.log("advancedFilterUtils tests passed ✓");
