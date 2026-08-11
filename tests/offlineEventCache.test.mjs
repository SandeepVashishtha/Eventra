import assert from "node:assert/strict";

// Mock localStorage globally
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => {
    store[key] = String(val);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  }
};

// Mock Date and Date.now() to control cache TTL expiry precisely
const originalDate = global.Date;
let mockCurrentTime = originalDate.now();

global.Date = class extends originalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(mockCurrentTime);
    } else {
      super(...args);
    }
  }
};
global.Date.now = () => mockCurrentTime;

const {
  saveCachedEvents,
  getCachedEvents,
  saveCachedEventDetail,
  getCachedEventDetail,
  getCacheAgeLabel,
  EVENTS_CACHE_TTL_MS,
  DETAIL_CACHE_TTL_MS
} = await import("../src/utils/offlineEventCache.js");

try {
  // Test Case 1: saveCachedEvents & getCachedEvents behavior
  localStorage.clear();
  assert.equal(getCachedEvents(), null, "Should return null when cache is empty");
  
  const events = [{ id: 1, title: "Event One" }, { id: 2, title: "Event Two" }];
  assert.equal(saveCachedEvents(events), true, "Should return true on successful cache write");
  
  const cached = getCachedEvents();
  assert.ok(cached, "Cached object should exist");
  assert.deepEqual(cached.events, events, "Should retrieve cached events accurately");
  
  // Test Case 2: Event list TTL Expiry and eviction
  mockCurrentTime += EVENTS_CACHE_TTL_MS + 1000; // Step beyond TTL
  assert.equal(getCachedEvents(), null, "Should evict stale cached events and return null after TTL");
  
  // Test Case 3: saveCachedEventDetail & getCachedEventDetail behavior
  localStorage.clear();
  mockCurrentTime = originalDate.now(); // reset time
  
  const singleEvent = { id: "evt_101", title: "Single Event Details" };
  assert.equal(saveCachedEventDetail(singleEvent), true, "Should cache individual event details");
  
  const detail = getCachedEventDetail("evt_101");
  assert.ok(detail, "Detail object should exist");
  assert.deepEqual(detail.event, singleEvent, "Should retrieve correct event detail");

  // Test Case 4: Event detail TTL Expiry, pruning, and eviction
  mockCurrentTime += DETAIL_CACHE_TTL_MS + 1000; // Step beyond TTL
  assert.equal(getCachedEventDetail("evt_101"), null, "Should evict stale event details after TTL expiry");

  // Test Case 5: getCacheAgeLabel output formats
  assert.equal(getCacheAgeLabel(null), "cached earlier");
  
  // Recently cached (less than 0 or negative age)
  mockCurrentTime = originalDate.now();
  assert.equal(getCacheAgeLabel(new Date(mockCurrentTime + 2000).toISOString()), "cached recently");
  
  // 1 minute ago
  assert.equal(getCacheAgeLabel(new Date(mockCurrentTime - 2000).toISOString()), "cached 1 min ago");
  
  // 5 minutes ago
  assert.equal(getCacheAgeLabel(new Date(mockCurrentTime - 5 * 60000).toISOString()), "cached 5 min ago");
  
  // 3 hours ago
  assert.equal(getCacheAgeLabel(new Date(mockCurrentTime - 3 * 3600000).toISOString()), "cached 3 hr ago");
  
  // 2 days ago
  assert.equal(getCacheAgeLabel(new Date(mockCurrentTime - 2 * 24 * 3600000).toISOString()), "cached 2 days ago");

  console.log("offlineEventCache tests passed ✓");
} finally {
  global.Date = originalDate;
  delete global.localStorage;
}
