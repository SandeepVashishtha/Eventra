import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  generateFilterSuggestions,
  getFallbackSuggestions,
  readSuggestionHistory,
  recordEventInteraction,
  recordFilterActivity,
  writeSuggestionHistory,
} from "../src/utils/filterSuggestions.js";

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
};

const now = new Date("2026-06-05T10:00:00.000Z").getTime();
const old = now - 1000 * 60 * 60 * 24 * 14;

const events = [
  {
    id: "1",
    title: "AI Builders Meetup",
    category: "AI & Machine Learning",
    type: "workshop",
    location: "Online",
    eventMode: "online",
    price: 0,
  },
  {
    id: "2",
    title: "React Summit",
    category: "Web Development",
    type: "conference",
    location: { city: "Mumbai", name: "NESCO" },
    eventMode: "offline",
  },
  {
    id: "3",
    title: "Cloud Native Day",
    category: "DevOps & Cloud",
    type: "summit",
    location: "Online",
    eventMode: "online",
  },
];

describe("filterSuggestions", () => {
  it("tracks applied filters and generates category/location/type suggestions", () => {
    let history = recordFilterActivity(
      {},
      {
        searchQuery: "ai",
        categoryFilter: "ai-ml",
        filterType: "upcoming",
        advancedFilters: {
          location: "Online",
          modes: ["online"],
          priceRange: { min: 0, max: 0 },
        },
      },
      now,
    );

    history = recordFilterActivity(history, { categoryFilter: "ai-ml" }, now + 1000);
    const suggestions = generateFilterSuggestions({ history, events, now, limit: 8 });

    assert.ok(suggestions.some((item) => item.kind === "category" && item.label === "AI/ML"));
    assert.ok(suggestions.some((item) => item.kind === "location" && item.label === "Online"));
    assert.ok(suggestions.some((item) => item.kind === "eventType" && item.label === "Online"));
    assert.ok(suggestions.some((item) => item.kind === "dateRange" && item.label === "Upcoming"));
  });

  it("prioritizes recent and frequent activity over older activity", () => {
    let history = recordFilterActivity({}, { categoryFilter: "web-development" }, old);
    history = recordFilterActivity(history, { categoryFilter: "ai-ml" }, now);
    history = recordFilterActivity(history, { categoryFilter: "ai-ml" }, now + 1000);

    const [first] = generateFilterSuggestions({ history, events, now: now + 2000, limit: 3 });

    assert.equal(first.kind, "category");
    assert.equal(first.label, "AI/ML");
  });

  it("weights stronger event interactions above passive views", () => {
    let history = recordEventInteraction({}, events[1], "view", now);
    history = recordEventInteraction(history, events[0], "bookmark", now + 1000);
    history = recordEventInteraction(history, events[0], "registration", now + 2000);

    const [first] = generateFilterSuggestions({ history, events, now: now + 3000, limit: 5 });

    assert.equal(first.kind, "category");
    assert.equal(first.label, "AI/ML");
  });

  it("persists and reloads suggestion history", () => {
    const storage = createStorage();
    const history = recordFilterActivity({}, { categoryFilter: "devops-cloud" }, now);

    writeSuggestionHistory(history, storage, "suggestions");
    const loaded = readSuggestionHistory(storage, "suggestions");

    assert.deepEqual(loaded.categories, history.categories);
  });

  it("recovers from corrupted storage", () => {
    const storage = createStorage();
    storage.setItem("suggestions", "{bad json");

    const loaded = readSuggestionHistory(storage, "suggestions");

    assert.deepEqual(loaded.categories, []);
    assert.equal(storage.has("suggestions"), false);
  });

  it("returns useful fallback suggestions for new users and empty datasets", () => {
    const eventFallback = getFallbackSuggestions(events);
    const emptyFallback = getFallbackSuggestions([]);

    assert.ok(eventFallback.some((item) => item.kind === "category"));
    assert.ok(emptyFallback.some((item) => item.label === "Upcoming"));
    assert.ok(emptyFallback.some((item) => item.label === "Online"));
  });

  it("prevents duplicate suggestions with identical filter payloads", () => {
    const history = recordFilterActivity({}, { categoryFilter: "ai-ml" }, now);
    const suggestions = generateFilterSuggestions({
      history,
      events,
      presets: [
        {
          id: "preset-1",
          name: "AI Preset",
          filters: { categoryFilter: "ai-ml" },
        },
      ],
      now,
      limit: 10,
    });
    const filterKeys = suggestions.map((item) => JSON.stringify(item.filters));

    assert.equal(new Set(filterKeys).size, filterKeys.length);
  });
});

console.log("filterSuggestions tests passed");
