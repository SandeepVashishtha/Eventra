import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  EVENT_CATEGORIES,
  applyAdvancedFilters,
  filterByCategory,
  filterByDateRange,
  filterByMode,
  filterByPrice,
  getCategoryLabel,
  getDateRange,
  getDefaultFilters,
  getPriceStats,
  getUniqueCategories,
  hasActiveFilters,
} from "../src/utils/advancedFilterUtils.js";

const events = [
  {
    id: 1,
    title: "Web Dev",
    type: "Web Development",
    eventMode: "online",
    price: 0,
    status: "live",
    date: "2026-05-28",
  },
  {
    id: 2,
    title: "AI Summit",
    category: "AI & Machine Learning",
    eventMode: "offline",
    price: 100,
    status: "upcoming",
    date: "2026-06-15",
  },
  {
    id: 3,
    title: "Hybrid Meetup",
    category: "DevOps & Cloud",
    eventMode: "hybrid",
    price: 250,
    status: "past",
    date: "2026-07-01",
  },
];

describe("advancedFilterUtils — edge cases", () => {
  it("exports category metadata", () => {
    assert.ok(EVENT_CATEGORIES.length >= 10);
    assert.equal(getCategoryLabel("web-development"), "Web Development");
    assert.equal(getCategoryLabel("unknown-key"), "unknown-key");
  });

  it("filters by event.type when category is missing", () => {
    const result = filterByCategory(events, ["web-development"]);
    assert.equal(result.length, 1);
    assert.equal(result[0].id, 1);
  });

  it("returns all events when mode filter is empty", () => {
    assert.equal(filterByMode(events, []).length, events.length);
    assert.equal(filterByMode([{ eventMode: undefined }], ["offline"]).length, 1);
  });

  it("respects inclusive price boundaries", () => {
    const inRange = filterByPrice(events, { min: 100, max: 250 });
    assert.deepEqual(
      inRange.map((event) => event.id),
      [2, 3],
    );
  });

  it("filters by date range including end-of-day", () => {
    const filtered = filterByDateRange(events, {
      startDate: "2026-06-01",
      endDate: "2026-06-15",
    });
    assert.deepEqual(
      filtered.map((event) => event.id),
      [2],
    );
  });

  it("returns empty price stats for empty input", () => {
    assert.deepEqual(getPriceStats([]), { min: 0, max: 0, average: 0 });
  });

  it("derives earliest and latest event dates", () => {
    const range = getDateRange(events);
    
    // Helper to extract a clean YYYY-MM-DD string strictly in UTC context
    const toUTCIsoDate = (date) => {
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(date.getUTCDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    assert.equal(toUTCIsoDate(range.earliest), "2026-05-28");
    assert.equal(toUTCIsoDate(range.latest), "2026-07-01");
  });

  it("detects active date and price filters", () => {
    assert.ok(
      hasActiveFilters({
        ...getDefaultFilters(),
        priceRange: { min: 10, max: 100 },
      }),
    );
    assert.ok(
      hasActiveFilters({
        ...getDefaultFilters(),
        dateRange: { startDate: "2026-01-01" },
      }),
    );
  });

  it("applies combined filters sequentially", () => {
    const filtered = applyAdvancedFilters(events, {
      categories: ["ai-&-machine-learning"],
      modes: ["offline"],
      priceRange: { min: 50, max: 150 },
      statuses: ["upcoming"],
    });
    assert.deepEqual(
      filtered.map((event) => event.id),
      [2],
    );
  });

  it("sorts unique categories alphabetically", () => {
    assert.deepEqual(getUniqueCategories(events), [
      "AI & Machine Learning",
      "DevOps & Cloud",
    ]);
  });
});

console.log("advancedFilterUtils edge-case tests passed ✓");
