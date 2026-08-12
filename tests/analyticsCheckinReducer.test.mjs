// Tests for the live-audience CHECKIN dedupe fix (#14609).
//
// The bug: the analyticsReducer CHECKIN case was purely additive
// (liveCount: state.liveCount + 1) with no id-based dedupe and no lower
// bound. A duplicate check-in broadcast (e.g. SSE reconnect replay) inflated
// liveCount, and a "-1 / checked-out" broadcast applied on top of whatever
// number was in the reducer could drive the count negative or wrong.
//
// The fix stores checked-in attendee ids in a bounded array (checkedInIds)
// and derives liveCount from that set, so an attendee is counted at most once;
// removal broadcasts (increment: -1 / type CHECKOUT / checkout flag) drop the
// id from the set and the count is clamped at zero.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Pure reducer logic mirrored from src/context/RealTimeContext.js
// ---------------------------------------------------------------------------

const CHECKED_IN_IDS_MAX = 500;

const initialAnalyticsState = {
  recentCheckins: [],
  liveCount: 0,
  scanVelocity: 0,
  status: "IDLE",
  checkedInIds: [],
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case "CHECKIN": {
      const payload = action.payload || {};
      const id =
        payload.id ||
        payload.eventId ||
        (payload.name && payload.event ? `${payload.name}::${payload.event}` : null);

      if (payload.increment === -1 || payload.type === "CHECKOUT" || payload.checkout === true) {
        if (id !== null && state.checkedInIds.includes(id)) {
          const checkedInIds = state.checkedInIds.filter((existing) => existing !== id);
          return { ...state, checkedInIds, liveCount: Math.max(0, checkedInIds.length) };
        }
        return { ...state, liveCount: Math.max(0, state.liveCount) };
      }

      if (id !== null && state.checkedInIds.includes(id)) {
        return state;
      }

      const checkedInIds =
        id === null
          ? state.checkedInIds
          : [...state.checkedInIds, id].slice(-CHECKED_IN_IDS_MAX);

      return {
        ...state,
        checkedInIds,
        recentCheckins: [payload, ...state.recentCheckins.slice(0, 49)],
        liveCount: id === null ? state.liveCount + 1 : Math.max(0, checkedInIds.length),
      };
    }
    case "UPDATE":
      return { ...state, ...action.payload };
    case "STATUS":
      return { ...state, status: action.payload };
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

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log("  pass  " + label);
    passed++;
  } catch (err) {
    console.error("  FAIL  " + label);
    console.error("        " + err.message);
    failed++;
  }
}

console.log("");
console.log("Single attendee counting");

test("first CHECKIN records the id and sets liveCount to 1", () => {
  const s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("a1"));
  assert.equal(s.liveCount, 1);
  assert.deepEqual(s.checkedInIds, ["a1"]);
});

test("liveCount is derived from the id set, not summed deltas", () => {
  let s = initialAnalyticsState;
  for (let i = 1; i <= 10; i++) { s = dispatch(s, "CHECKIN", makeCheckin("u" + i)); }
  assert.equal(s.liveCount, 10);
  assert.equal(s.checkedInIds.length, 10);
});

console.log("");
console.log("Duplicate check-in broadcasts");

test("duplicate CHECKIN with the same id is ignored (returns same state reference)", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("dup1"));
  const before = s;
  s = dispatch(s, "CHECKIN", makeCheckin("dup1"));
  assert.strictEqual(s, before, "reducer must return the identical state for a duplicate");
});

test("SSE reconnect replay does not inflate liveCount", () => {
  let s = initialAnalyticsState;
  for (const id of ["r1", "r2", "r3"]) { s = dispatch(s, "CHECKIN", makeCheckin(id)); }
  assert.equal(s.liveCount, 3);
  for (let round = 0; round < 3; round++) {
    for (const id of ["r1", "r2", "r3"]) { s = dispatch(s, "CHECKIN", makeCheckin(id)); }
  }
  assert.equal(s.liveCount, 3, "replayed ids must not be counted again");
  assert.equal(s.checkedInIds.length, 3);
});

console.log("");
console.log("Check-out / removal");

test("increment -1 removes the attendee and decrements the count", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("x1"));
  s = dispatch(s, "CHECKIN", makeCheckin("x2"));
  assert.equal(s.liveCount, 2);
  s = dispatch(s, "CHECKIN", { ...makeCheckin("x1"), increment: -1 });
  assert.equal(s.liveCount, 1);
  assert.ok(!s.checkedInIds.includes("x1"));
});

test("type CHECKOUT removes the attendee", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("y1"));
  s = dispatch(s, "CHECKIN", { ...makeCheckin("y1"), type: "CHECKOUT" });
  assert.equal(s.liveCount, 0);
  assert.equal(s.checkedInIds.length, 0);
});

test("double checkout of the same attendee does not go below zero", () => {
  let s = dispatch(initialAnalyticsState, "CHECKIN", makeCheckin("z1"));
  s = dispatch(s, "CHECKIN", { ...makeCheckin("z1"), increment: -1 });
  s = dispatch(s, "CHECKIN", { ...makeCheckin("z1"), increment: -1 });
  assert.equal(s.liveCount, 0, "count must be clamped at zero");
});

test("checkout of an attendee never seen locally is clamped at zero", () => {
  const s = dispatch(initialAnalyticsState, "CHECKIN", { ...makeCheckin("ghost"), increment: -1 });
  assert.equal(s.liveCount, 0, "unknown attendee removal must not drive the count negative");
});

console.log("");
console.log("Events without a stable id");

test("id-less events keep the legacy additive behaviour", () => {
  const noId = { name: "Guest", time: "now", status: "Verified" };
  let s = dispatch(initialAnalyticsState, "CHECKIN", noId);
  s = dispatch(s, "CHECKIN", noId);
  assert.equal(s.liveCount, 2, "id-less events cannot be deduped, so they still increment");
});

test("name + event payloads derive a stable id for dedupe", () => {
  const named = { name: "Ada", event: "Open Day", time: "now", status: "Verified" };
  let s = dispatch(initialAnalyticsState, "CHECKIN", named);
  s = dispatch(s, "CHECKIN", named);
  assert.equal(s.liveCount, 1, "check-ins carrying name + event are deduped via the derived id");
});

test("id-less events do not pollute checkedInIds", () => {
  const s = dispatch(initialAnalyticsState, "CHECKIN", { name: "Guest" });
  assert.equal(s.checkedInIds.length, 0);
});

console.log("");
console.log("Bounds");

test("checkedInIds never exceeds CHECKED_IN_IDS_MAX", () => {
  let s = initialAnalyticsState;
  for (let i = 0; i < CHECKED_IN_IDS_MAX + 50; i++) {
    s = dispatch(s, "CHECKIN", makeCheckin("long" + i));
  }
  assert.ok(s.checkedInIds.length <= CHECKED_IN_IDS_MAX, "checkedInIds grew beyond the bound");
});

console.log("");
console.log("Source contract (src/context/RealTimeContext.js)");

const contextSrc = readFileSync(
  path.resolve(__dirname, "../src/context/RealTimeContext.js"),
  "utf8"
);

test("reducer derives liveCount from checkedInIds and clamps at zero", () => {
  assert.ok(
    contextSrc.includes("liveCount: id === null ? state.liveCount + 1 : Math.max(0, checkedInIds.length)"),
    "liveCount must be derived from the id set (legacy increment only for id-less events)"
  );
  assert.ok(
    contextSrc.includes("Math.max(0, checkedInIds.length)"),
    "checked-in count must be clamped at zero"
  );
});

test("duplicate check-ins short-circuit before touching liveCount", () => {
  assert.ok(
    contextSrc.includes("id !== null && state.checkedInIds.includes(id)"),
    "duplicate attendee ids must be ignored"
  );
  assert.ok(
    contextSrc.includes("return state;"),
    "duplicate delivery must return the unchanged state"
  );
});

test("removal broadcasts (increment -1 / CHECKOUT / checkout) are handled", () => {
  assert.ok(
    contextSrc.includes('payload.increment === -1 || payload.type === "CHECKOUT" || payload.checkout === true'),
    "removal broadcasts must be recognised and applied as a check-out"
  );
});

test("checkedInIds is part of the analytics state and memo deps", () => {
  assert.ok(
    contextSrc.includes("checkedInIds: []"),
    "analytics state must initialise the checkedInIds set"
  );
  assert.ok(
    contextSrc.includes("state.checkedInIds"),
    "checkedInIds must be present in the memoized context value dependencies"
  );
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
