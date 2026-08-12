// Tests for the analytics CHECKIN deduplication fix.
//
// The bug: the analyticsReducer CHECKIN case was purely additive -- every
// dispatched event incremented liveCount regardless of whether the same
// event ID had already been processed. Under SSE reconnect scenarios the
// server can re-deliver recent events, which caused liveCount and
// recentCheckins to drift from actual backend state.
//
// The fix adds a bounded seenEventIds array to reducer state. Incoming
// CHECKIN events are silently dropped when their id is already present.
// The cache is capped at SEEN_EVENTS_MAX (200) entries; older entries are
// evicted to prevent unbounded memory growth in long-lived sessions.

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Pure reducer logic mirrored from src/context/RealTimeContext.js
// ---------------------------------------------------------------------------

const SEEN_EVENTS_MAX = 200;

const initialAnalyticsState = {
  recentCheckins: [],
  liveCount: 0,
  scanVelocity: 0,
  seenEventIds: [],
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case "CHECKIN": {
      const eventId = action.payload?.id;
      if (eventId && state.seenEventIds.includes(eventId)) {
        return state;
      }
      const updatedSeenIds = eventId
        ? [...state.seenEventIds, eventId].slice(-SEEN_EVENTS_MAX)
        : state.seenEventIds;
      return {
        ...state,
        seenEventIds: updatedSeenIds,
        recentCheckins: [action.payload, ...state.recentCheckins.slice(0, 49)],
        liveCount: state.liveCount + 1,
      };
    }
    case "UPDATE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function makeCheckin(id, name) {
  return { id, name: name || "Attendee " + id, event: "Test Event", time: "now", status: "Verified" };
}

function dispatch(state, type, payload) {
  return analyticsReducer(state, { type, payload });
}

let passed = 0; let failed = 0;

function test(label, fn) {
  try { fn(); console.log("  pass  " + label); passed++; }
  catch (err) { console.error("  FAIL  " + label); console.error("        " + err.message); failed++; }
}

console.log("");
console.log("Normal attendee updates");

test("first CHECKIN increments liveCount from 0 to 1", () => {
  const s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("c1"));
  assert.equal(s.liveCount, 1);
  assert.equal(s.recentCheckins.length, 1);
  assert.equal(s.recentCheckins[0].id, "c1");
});

test("CHECKIN prepends to recentCheckins", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("c1"));
  s = dispatch(s, "CHECKIN", makeCheckin("c2"));
  assert.equal(s.recentCheckins[0].id, "c2");
  assert.equal(s.recentCheckins[1].id, "c1");
});

test("records event ID in seenEventIds after first CHECKIN", () => {
  const s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("c42"));
  assert.ok(s.seenEventIds.includes("c42"));
});

console.log("");
console.log("Multiple unique attendee events");

test("N unique events produce liveCount === N", () => {
  let s = initialAnalyticsState;
  for (let i = 1; i <= 10; i++) { s = dispatch(s, "CHECKIN", makeCheckin("u" + i)); }
  assert.equal(s.liveCount, 10);
  assert.equal(s.recentCheckins.length, 10);
});

test("all unique IDs are recorded in seenEventIds", () => {
  let s = initialAnalyticsState;
  for (let i = 1; i <= 5; i++) { s = dispatch(s, "CHECKIN", makeCheckin("uid" + i)); }
  assert.equal(s.seenEventIds.length, 5);
  for (let i = 1; i <= 5; i++) { assert.ok(s.seenEventIds.includes("uid" + i)); }
});

console.log("");
console.log("Duplicate event delivery");

test("duplicate CHECKIN with same id is ignored", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("dup1"));
  const afterFirst = s;
  s = dispatch(s, "CHECKIN", makeCheckin("dup1"));
  assert.equal(s.liveCount, afterFirst.liveCount, "liveCount must not change on duplicate");
  assert.equal(s.recentCheckins.length, afterFirst.recentCheckins.length, "recentCheckins must not grow on duplicate");
});

test("duplicate returns the exact same state reference", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("ref1"));
  const before = s;
  s = dispatch(s, "CHECKIN", makeCheckin("ref1"));
  assert.strictEqual(s, before, "reducer must return identical state reference for duplicate");
});

test("duplicate does not prepend to recentCheckins", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("dup2"));
  s = dispatch(s, "CHECKIN", makeCheckin("other"));
  const snapshot = s.recentCheckins.slice();
  s = dispatch(s, "CHECKIN", makeCheckin("dup2"));
  assert.deepEqual(s.recentCheckins, snapshot);
});

test("duplicate does not add a second copy to seenEventIds", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("dedup3"));
  s = dispatch(s, "CHECKIN", makeCheckin("dedup3"));
  assert.equal(s.seenEventIds.filter(function(id) { return id === "dedup3"; }).length, 1);
});

console.log("");
console.log("SSE reconnect scenario");

test("events replayed on reconnect are ignored after initial processing", () => {
  let s = initialAnalyticsState;
  s = dispatch(s, "CHECKIN", makeCheckin("e1"));
  s = dispatch(s, "CHECKIN", makeCheckin("e2"));
  s = dispatch(s, "CHECKIN", makeCheckin("e3"));
  assert.equal(s.liveCount, 3);
  // SSE reconnect: server re-delivers e1, e2, e3 then continues with e4
  s = dispatch(s, "CHECKIN", makeCheckin("e1"));
  s = dispatch(s, "CHECKIN", makeCheckin("e2"));
  s = dispatch(s, "CHECKIN", makeCheckin("e3"));
  s = dispatch(s, "CHECKIN", makeCheckin("e4"));
  assert.equal(s.liveCount, 4, "reconnect replay must not inflate liveCount");
  assert.equal(s.recentCheckins[0].id, "e4");
});

test("repeated reconnects with full replay do not inflate count", () => {
  let s = initialAnalyticsState;
  var ids = ["r1","r2","r3","r4","r5"];
  ids.forEach(function(id) { s = dispatch(s, "CHECKIN", makeCheckin(id)); });
  assert.equal(s.liveCount, 5);
  for (let round = 0; round < 3; round++) {
    ids.forEach(function(id) { s = dispatch(s, "CHECKIN", makeCheckin(id)); });
  }
  assert.equal(s.liveCount, 5, "repeated replays must not change liveCount");
});

console.log("");
console.log("Replay of historical events");

test("historical event replayed after new events does not affect count", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("hist1"));
  s = dispatch(s, "CHECKIN", makeCheckin("new1"));
  s = dispatch(s, "CHECKIN", makeCheckin("new2"));
  const count = s.liveCount;
  s = dispatch(s, "CHECKIN", makeCheckin("hist1"));
  assert.equal(s.liveCount, count, "historical replay must not increment liveCount");
});

test("new event after replay is still counted correctly", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("h1"));
  s = dispatch(s, "CHECKIN", makeCheckin("h1"));
  s = dispatch(s, "CHECKIN", makeCheckin("h2"));
  assert.equal(s.liveCount, 2);
  assert.equal(s.recentCheckins[0].id, "h2");
});

console.log("");
console.log("Events without id field");

test("event with no id is always processed", () => {
  var noId = { name: "Guest", event: "Open Day", time: "now", status: "Verified" };
  let s = dispatch(initialAnalyticsState, "CHECKIN", noId);
  s = dispatch(s, "CHECKIN", noId);
  assert.equal(s.liveCount, 2);
});

test("event with undefined id does not pollute seenEventIds", () => {
  var noId = { name: "Guest" };
  const s = dispatch(initialAnalyticsState, "CHECKIN", noId);
  assert.equal(s.seenEventIds.length, 0);
});

console.log("");
console.log("Cache eviction (long sessions)");

test("seenEventIds never exceeds SEEN_EVENTS_MAX", () => {
  let s = initialAnalyticsState;
  for (let i = 0; i < SEEN_EVENTS_MAX + 50; i++) {
    s = dispatch(s, "CHECKIN", makeCheckin("long" + i));
  }
  assert.ok(s.seenEventIds.length <= SEEN_EVENTS_MAX, "seenEventIds grew beyond SEEN_EVENTS_MAX: " + s.seenEventIds.length);
});

test("liveCount is still correct after cache eviction", () => {
  let s = initialAnalyticsState;
  const total = SEEN_EVENTS_MAX + 50;
  for (let i = 0; i < total; i++) { s = dispatch(s, "CHECKIN", makeCheckin("ev" + i)); }
  assert.equal(s.liveCount, total, "every unique event must be counted even after eviction");
});

test("after eviction an evicted ID can be re-processed once", () => {
  let s = initialAnalyticsState;
  for (let i = 0; i < SEEN_EVENTS_MAX + 10; i++) {
    s = dispatch(s, "CHECKIN", makeCheckin("fill" + i));
  }
  assert.ok(!s.seenEventIds.includes("fill0"), "fill0 should have been evicted");
  const countBefore = s.liveCount;
  s = dispatch(s, "CHECKIN", makeCheckin("fill0"));
  assert.equal(s.liveCount, countBefore + 1, "evicted ID must be re-accepted as new");
});

console.log("");
console.log("Regression: original additive-liveCount bug");

test("old reducer would inflate count -- confirming the fix prevents it", () => {
  function buggyReducer(state, action) {
    if (action.type === "CHECKIN") {
      return { ...state, recentCheckins: [action.payload, ...state.recentCheckins.slice(0, 49)], liveCount: state.liveCount + 1 };
    }
    return state;
  }
  const event = makeCheckin("reg1");
  let buggy = { recentCheckins: [], liveCount: 0 };
  buggy = buggyReducer(buggy, { type: "CHECKIN", payload: event });
  buggy = buggyReducer(buggy, { type: "CHECKIN", payload: event });
  buggy = buggyReducer(buggy, { type: "CHECKIN", payload: event });
  assert.equal(buggy.liveCount, 3, "old reducer inflated count to 3 for one real event");
  let fixed = initialAnalyticsState;
  fixed = dispatch(fixed, "CHECKIN", event);
  fixed = dispatch(fixed, "CHECKIN", event);
  fixed = dispatch(fixed, "CHECKIN", event);
  assert.equal(fixed.liveCount, 1, "fixed reducer must count the event exactly once");
});

test("regression: two unique events + reconnect replay keeps count at 2", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("rg-a"));
  s = dispatch(s, "CHECKIN", makeCheckin("rg-b"));
  assert.equal(s.liveCount, 2);
  s = dispatch(s, "CHECKIN", makeCheckin("rg-a"));
  s = dispatch(s, "CHECKIN", makeCheckin("rg-b"));
  assert.equal(s.liveCount, 2, "count must remain 2 after reconnect replay");
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
