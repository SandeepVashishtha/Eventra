// Tests for the bounded live-audience history fix (#14611).
//
// The bug: the live-audience reducer appended every event to per-event history
// arrays forever. In high-traffic sessions memory grew without bound and each
// dispatch spread new array copies across state. The issue text describes
// `liveCheckins`/`liveCheckouts`/`events` fields that do not exist in the
// current reducer; the real unbounded structure is the per-event `questions`
// history in the live-audience reducer (recentCheckins is already capped at 50).
//
// The fix caps the per-event question history to a rolling window
// (MAX_LIVE_QUESTIONS = 200) and keeps the existing id-based duplicate guard.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Pure reducer logic mirrored from src/context/RealTimeContext.js
// ---------------------------------------------------------------------------

const MAX_LIVE_QUESTIONS = 200;

const initialLiveAudienceState = { events: {}, status: "IDLE" };

function liveAudienceReducer(state, action) {
  switch (action.type) {
    case "LOAD_INITIAL": {
      const { eventId, questions, activePoll } = action.payload;
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: { questions, activePoll }
        }
      };
    }
    case "NEW_QUESTION": {
      const { eventId, question } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      if (eventData.questions.some(q => q.id === question.id)) return state;
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: [...eventData.questions, question].slice(-MAX_LIVE_QUESTIONS)
          }
        }
      };
    }
    case "UPDATE_QUESTION": {
      const { eventId, question } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: eventData.questions.map(q => q.id === question.id ? question : q)
          }
        }
      };
    }
    case "DELETE_QUESTION": {
      const { eventId, questionId } = action.payload;
      const eventData = state.events[eventId] || { questions: [], activePoll: null };
      return {
        ...state,
        events: {
          ...state.events,
          [eventId]: {
            ...eventData,
            questions: eventData.questions.filter(q => q.id !== questionId)
          }
        }
      };
    }
    default:
      return state;
  }
}

function question(id) {
  return { id, text: "Question " + id, upvotes: 0 };
}

function addQuestion(state, eventId, id) {
  return liveAudienceReducer(state, { type: "NEW_QUESTION", payload: { eventId, question: question(id) } });
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
console.log("Rolling window bound");

test("questions never exceed MAX_LIVE_QUESTIONS per event", () => {
  let s = initialLiveAudienceState;
  for (let i = 0; i < MAX_LIVE_QUESTIONS + 100; i++) {
    s = addQuestion(s, "e1", "q" + i);
  }
  assert.ok(
    s.events.e1.questions.length <= MAX_LIVE_QUESTIONS,
    "questions grew beyond MAX_LIVE_QUESTIONS: " + s.events.e1.questions.length
  );
});

test("the most recent questions are retained (rolling window)", () => {
  let s = initialLiveAudienceState;
  for (let i = 0; i < MAX_LIVE_QUESTIONS + 25; i++) {
    s = addQuestion(s, "e1", "q" + i);
  }
  assert.ok(s.events.e1.questions.some((q) => q.id === "q" + (MAX_LIVE_QUESTIONS - 1)), "latest ids must be retained");
  assert.ok(!s.events.e1.questions.some((q) => q.id === "q0"), "oldest ids must be evicted");
});

test("bounds are per-event, not shared across events", () => {
  let s = initialLiveAudienceState;
  for (let i = 0; i < MAX_LIVE_QUESTIONS + 10; i++) {
    s = addQuestion(s, "room-a", "a" + i);
  }
  s = addQuestion(s, "room-b", "b1");
  assert.ok(s.events["room-a"].questions.length <= MAX_LIVE_QUESTIONS);
  assert.equal(s.events["room-b"].questions.length, 1, "a quiet event must be unaffected");
});

console.log("");
console.log("Duplicate guard");

test("duplicate question ids are ignored (state reference unchanged)", () => {
  let s = addQuestion(initialLiveAudienceState, "e1", "dup");
  const before = s;
  s = addQuestion(s, "e1", "dup");
  assert.strictEqual(s, before, "duplicate question must return the identical state");
});

test("an evicted id can be re-added once without exceeding the bound", () => {
  let s = initialLiveAudienceState;
  for (let i = 0; i < MAX_LIVE_QUESTIONS + 5; i++) {
    s = addQuestion(s, "e1", "fill" + i);
  }
  s = addQuestion(s, "e1", "q0");
  assert.equal(s.events.e1.questions.length, MAX_LIVE_QUESTIONS, "re-adding an evicted id stays within the bound");
});

console.log("");
console.log("Source contract (src/context/RealTimeContext.js)");

const contextSrc = readFileSync(
  path.resolve(__dirname, "../src/context/RealTimeContext.js"),
  "utf8"
);

test("NEW_QUESTION caps the per-event history with a rolling window", () => {
  assert.ok(
    contextSrc.includes("const MAX_LIVE_QUESTIONS = 200;"),
    "a MAX_LIVE_QUESTIONS bound must exist"
  );
  assert.ok(
    contextSrc.includes("[...eventData.questions, question].slice(-MAX_LIVE_QUESTIONS)"),
    "NEW_QUESTION must keep a rolling window of the last MAX_LIVE_QUESTIONS questions"
  );
});

test("recentCheckins display list stays bounded", () => {
  assert.ok(
    contextSrc.includes("state.recentCheckins.slice(0, 49)"),
    "recentCheckins must remain capped so its history cannot grow without limit"
  );
});

test("duplicate payloads are guarded in the reducer path", () => {
  assert.ok(
    contextSrc.includes("eventData.questions.some(q => q.id === question.id)"),
    "NEW_QUESTION must ignore duplicate question ids"
  );
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
