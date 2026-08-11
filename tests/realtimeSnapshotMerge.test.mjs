// Tests for the snapshot/live merge fix (#14610).
//
// The bug: the analytics reducer's UPDATE case did `{ ...state, ...payload }`
// and the live-audience reducer's LOAD_INITIAL case replaced `questions`
// wholesale. When a snapshot (reconnect / initial load) resolved after SSE
// events had already been applied live, the snapshot wiped the SSE-arrived
// entries — whatever resolved last won, so counts/lists lost entries and
// diverged across tabs.
//
// The fix merges instead of replacing: snapshot lists are unioned with the
// locally-applied entries by id (idempotent), and liveCount is recomputed from
// the merged set.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Pure reducer logic mirrored from src/context/RealTimeContext.js
// ---------------------------------------------------------------------------

function mergeUniqueById(...lists) {
  const byId = new Map();
  for (const list of lists) {
    for (const item of list || []) {
      const key = item && (item.id ?? item.eventId);
      if (key === undefined || key === null || key === "") continue;
      if (!byId.has(key)) byId.set(key, item);
    }
  }
  return Array.from(byId.values());
}

const initialAnalyticsState = {
  recentCheckins: [],
  liveCount: 0,
  scanVelocity: 0,
  status: "IDLE",
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case "CHECKIN":
      return {
        ...state,
        recentCheckins: [action.payload, ...state.recentCheckins.slice(0, 49)],
        liveCount: state.liveCount + 1,
      };
    case "UPDATE": {
      const incoming = action.payload || {};
      if (!Array.isArray(incoming.recentCheckins)) {
        return { ...state, ...incoming };
      }
      const mergedCheckins = mergeUniqueById(state.recentCheckins, incoming.recentCheckins);
      return {
        ...state,
        ...incoming,
        recentCheckins: mergedCheckins.slice(0, 50),
        liveCount: mergedCheckins.length,
      };
    }
    case "STATUS":
      return { ...state, status: action.payload };
    default:
      return state;
  }
}

const initialLiveAudienceState = { events: {}, status: "IDLE" };

function liveAudienceReducer(state, action) {
  switch (action.type) {
    case "LOAD_INITIAL": {
      const { eventId, questions, activePoll } = action.payload;
      const existing = state.events[eventId] || { questions: [], activePoll: null };
      const mergedById = new Map();
      for (const q of existing.questions || []) {
        if (q && q.id !== undefined && q.id !== null) mergedById.set(q.id, q);
      }
      for (const q of questions || []) {
        if (q && q.id !== undefined && q.id !== null) mergedById.set(q.id, q);
      }
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            questions: Array.from(mergedById.values()),
            activePoll: activePoll ?? existing.activePoll,
          },
        },
      };
    }
    case "NEW_QUESTION": {
      const { eventId, question } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      if (eventData.questions.some((q) => q.id === question.id)) return state;
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: [...eventData.questions, question],
          },
        },
      };
    }
    default:
      return state;
  }
}

function checkin(id, name) {
  return { id, name: name || "Attendee " + id, event: "Test Event", time: "now", status: "Verified" };
}

function question(id, text) {
  return { id, text: text || "Question " + id, upvotes: 0 };
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
console.log("Analytics snapshot vs live check-ins");

test("snapshot UPDATE unions snapshot ids with locally-applied ids", () => {
  let s = initialAnalyticsState;
  // SSE applies c1 and c2 live before the snapshot resolves.
  s = analyticsReducer(s, { type: "CHECKIN", payload: checkin("c1") });
  s = analyticsReducer(s, { type: "CHECKIN", payload: checkin("c2") });
  assert.equal(s.liveCount, 2);
  // The snapshot already contains c1..c3; c2 and c3 are new to it.
  const snapshot = [checkin("c1"), checkin("c2"), checkin("c3")];
  s = analyticsReducer(s, { type: "UPDATE", payload: { recentCheckins: snapshot } });
  const ids = s.recentCheckins.map((c) => c.id).sort();
  assert.deepEqual(ids, ["c1", "c2", "c3"], "merged set must contain every unique id");
  assert.equal(s.liveCount, 3, "liveCount must equal the merged set size");
});

test("stale snapshot does not drop SSE-applied check-ins", () => {
  let s = initialAnalyticsState;
  s = analyticsReducer(s, { type: "CHECKIN", payload: checkin("live1") });
  s = analyticsReducer(s, { type: "CHECKIN", payload: checkin("live2") });
  // Snapshot was captured server-side before live1/live2 streamed.
  s = analyticsReducer(s, { type: "UPDATE", payload: { recentCheckins: [checkin("live1")] } });
  assert.ok(s.recentCheckins.some((c) => c.id === "live2"), "live2 must survive the snapshot merge");
  assert.equal(s.liveCount, 2);
});

test("duplicate ids across snapshot and live are counted once", () => {
  let s = initialAnalyticsState;
  s = analyticsReducer(s, { type: "CHECKIN", payload: checkin("dup") });
  s = analyticsReducer(s, { type: "UPDATE", payload: { recentCheckins: [checkin("dup"), checkin("other")] } });
  const dupCount = s.recentCheckins.filter((c) => c.id === "dup").length;
  assert.equal(dupCount, 1, "a duplicate id must appear exactly once");
  assert.equal(s.liveCount, 2);
});

test("metrics-only UPDATE (no recentCheckins) keeps existing behaviour", () => {
  let s = analyticsReducer(initialAnalyticsState, { type: "UPDATE", payload: { liveCount: 42, scanVelocity: 3 } });
  assert.equal(s.liveCount, 42);
  assert.equal(s.scanVelocity, 3);
});

test("repeated snapshots are idempotent", () => {
  let s = analyticsReducer(initialAnalyticsState, { type: "CHECKIN", payload: checkin("i1") });
  s = analyticsReducer(s, { type: "UPDATE", payload: { recentCheckins: [checkin("i1"), checkin("i2")] } });
  s = analyticsReducer(s, { type: "UPDATE", payload: { recentCheckins: [checkin("i1"), checkin("i2"), checkin("i3")] } });
  assert.equal(s.liveCount, 3);
});

console.log("");
console.log("Live-audience LOAD_INITIAL vs SSE questions");

test("LOAD_INITIAL merges snapshot questions with locally-streamed ones", () => {
  let s = initialLiveAudienceState;
  // A question arrives via SSE before the snapshot resolves.
  s = liveAudienceReducer(s, { type: "NEW_QUESTION", payload: { eventId: "e1", question: question("q1") } });
  s = liveAudienceReducer(s, { type: "LOAD_INITIAL", payload: { eventId: "e1", questions: [question("q1"), question("q2")], activePoll: null } });
  const ids = s.events.e1.questions.map((q) => q.id).sort();
  assert.deepEqual(ids, ["q1", "q2"], "snapshot + SSE questions must be unioned");
});

test("LOAD_INITIAL snapshot wins for ids it already knows", () => {
  let s = initialLiveAudienceState;
  s = liveAudienceReducer(s, { type: "NEW_QUESTION", payload: { eventId: "e1", question: question("q1", "stale text") } });
  s = liveAudienceReducer(s, { type: "LOAD_INITIAL", payload: { eventId: "e1", questions: [question("q1", "fresh text")], activePoll: null } });
  assert.equal(s.events.e1.questions[0].text, "fresh text", "snapshot content must replace local for the same id");
});

test("LOAD_INITIAL retains an SSE-applied poll when the snapshot has none", () => {
  let s = initialLiveAudienceState;
  s = liveAudienceReducer(s, { type: "LOAD_INITIAL", payload: { eventId: "e1", questions: [], activePoll: { id: "p1" } } });
  s = liveAudienceReducer(s, { type: "LOAD_INITIAL", payload: { eventId: "e1", questions: [], activePoll: null } });
  assert.equal(s.events.e1.activePoll.id, "p1", "existing poll must be retained when the snapshot has none");
});

console.log("");
console.log("Source contract (src/context/RealTimeContext.js)");

const contextSrc = readFileSync(
  path.resolve(__dirname, "../src/context/RealTimeContext.js"),
  "utf8"
);

test("UPDATE merges recentCheckins by id and recomputes liveCount", () => {
  assert.ok(
    contextSrc.includes("mergeUniqueById(state.recentCheckins, incoming.recentCheckins)"),
    "UPDATE must union snapshot check-ins with locally-applied ones"
  );
  assert.ok(
    contextSrc.includes("liveCount: mergedCheckins.length"),
    "liveCount must be recomputed from the merged set"
  );
});

test("LOAD_INITIAL merges questions by id instead of replacing", () => {
  assert.ok(
    contextSrc.includes('"LOAD_INITIAL"'),
    "LOAD_INITIAL must merge rather than replace"
  );
  assert.ok(
    contextSrc.includes("mergedById.set(q.id, q)"),
    "questions must be merged by id"
  );
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
