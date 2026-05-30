import assert from "node:assert/strict";

const store = {};
global.localStorage = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) delete store[key];
  },
};

let now = Date.parse("2026-05-30T12:00:00.000Z");
const OriginalDate = global.Date;
class MockDate extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(now);
      return;
    }
    super(...args);
  }

  static now() {
    return now;
  }
}
global.Date = MockDate;

const {
  saveCachedEvents,
  getCachedEvents,
  saveCachedEventDetail,
  getCachedEventDetail,
  getCacheAgeLabel,
  EVENTS_CACHE_TTL_MS,
  DETAIL_CACHE_TTL_MS,
} = await import("../src/utils/offlineEventCache.js");

try {
  assert.equal(saveCachedEvents([]), false, "does not cache empty lists");

  const events = [{ id: "evt-1", title: "Launch" }];
  assert.equal(saveCachedEvents(events), true, "persists event lists");

  const cachedList = getCachedEvents();
  assert.deepEqual(cachedList.events, events, "reads cached event lists");
  assert.ok(cachedList.cachedAt, "stores cachedAt timestamp");

  now += EVENTS_CACHE_TTL_MS + 1;
  assert.equal(getCachedEvents(), null, "evicts expired event lists");

  now = Date.parse("2026-05-30T12:00:00.000Z");
  saveCachedEventDetail({ id: "evt-2", title: "Workshop" });
  assert.deepEqual(
    getCachedEventDetail("evt-2").event,
    { id: "evt-2", title: "Workshop" },
    "reads cached event detail"
  );

  now += DETAIL_CACHE_TTL_MS + 1;
  assert.equal(getCachedEventDetail("evt-2"), null, "prunes expired event detail");

  now = Date.parse("2026-05-30T12:00:00.000Z");
  assert.match(getCacheAgeLabel(new Date(now - 5 * 60_000).toISOString()), /5 min ago/);
  assert.equal(getCacheAgeLabel(null), "cached earlier");

  console.log("offlineEventCache tests passed ✓");
} finally {
  global.Date = OriginalDate;
}
