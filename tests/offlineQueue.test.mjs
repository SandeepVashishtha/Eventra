/**
 * Unit tests for src/utils/offlineQueue.js
 *
 * Tests the localStorage-backed synchronous layer (getQueue / setQueue /
 * clearQueue) and the async pushToQueue (localStorage mirror only — IndexedDB
 * path is expected to fail gracefully in Node.js, which has no indexedDB).
 *
 * Node.js v18+ supports top-level await in .mjs files, which is used here.
 */

import assert from "node:assert/strict";

// ── Minimal browser-API stubs ──────────────────────────────────────────────
// These must be set on `global` BEFORE the ESM module is imported so the
// module closure captures them.

const _store = {};
global.localStorage = {
  getItem: (key) => (key in _store ? _store[key] : null),
  setItem: (key, val) => {
    _store[key] = String(val);
  },
  removeItem: (key) => {
    delete _store[key];
  },
  clear: () => {
    for (const k of Object.keys(_store)) delete _store[k];
  },
};

const _sessionStore = {};
global.sessionStorage = {
  getItem: (key) => (key in _sessionStore ? _sessionStore[key] : null),
  setItem: (key, val) => {
    _sessionStore[key] = String(val);
  },
  removeItem: (key) => {
    delete _sessionStore[key];
  },
  clear: () => {
    for (const k of Object.keys(_sessionStore)) delete _sessionStore[k];
  },
};

// Stub out window.indexedDB so openDB() rejects cleanly
global.window = {
  indexedDB: null,
  sessionStorage: global.sessionStorage,
};
global.indexedDB = null;

// Silence console noise from the module's own warnings
global.console = {
  warn: () => {},
  error: () => {},
  log: console.log,
};

// Stub crypto.randomUUID so generateQueueId works without Web Crypto
let _uuid = 0;
Object.defineProperty(global, "crypto", {
  configurable: true,
  value: { randomUUID: () => `mock-uuid-${++_uuid}` },
});

// Import module AFTER stubs are in place
const {
  getQueue,
  pushToQueue,
  setQueue,
  clearQueue,
  validateQueueSession,
  processQueue,
} = await import(
  "../src/utils/offlineQueue.js"
);
const { ensureSessionSnapshot } = await import("../src/utils/sessionSnapshot.js");

// ── Helper ──────────────────────────────────────────────────────────────────
function reset() {
  localStorage.clear();
  sessionStorage.clear();
}

// ── getQueue ────────────────────────────────────────────────────────────────
reset();
assert.deepEqual(getQueue(), [], "getQueue() returns [] when storage is empty");

reset();
global.localStorage.setItem(
  "eventra_offline_queue",
  JSON.stringify([{ eventId: "e1" }])
);
assert.equal(getQueue().length, 1, "getQueue() parses stored items");
assert.equal(getQueue()[0].eventId, "e1", "getQueue() returns correct item");

reset();
global.localStorage.setItem("eventra_offline_queue", "INVALID_JSON{{");
assert.deepEqual(
  getQueue(),
  [],
  "getQueue() returns [] on malformed JSON (graceful fallback)"
);

// ── pushToQueue (localStorage mirror only; IndexedDB is absent) ─────────────
reset();
await pushToQueue({ eventId: "evt-a", payload: { user: "Alice" } });
assert.equal(getQueue().length, 1, "pushToQueue() stores one item");
assert.equal(getQueue()[0].eventId, "evt-a", "pushToQueue() stores correct eventId");
assert.ok(getQueue()[0].timestamp, "pushToQueue() attaches a timestamp");
assert.equal(getQueue()[0].retryCount, 0, "pushToQueue() initialises retryCount to 0");

// ── session snapshot initialization ───────────────────────────────────────
reset();
const queuedWithSession = await pushToQueue(
  { eventId: "evt-session", payload: { user: "Session User" } },
  "user-1"
);
const sessionBackedQueue = getQueue();
assert.equal(queuedWithSession, true, "pushToQueue() succeeds with session snapshot");
assert.ok(
  sessionStorage.getItem("session_id"),
  "pushToQueue() initializes session_id when it is missing"
);
assert.equal(
  sessionBackedQueue[0].sessionId,
  sessionStorage.getItem("session_id"),
  "queued item stores the initialized session snapshot"
);
assert.equal(
  sessionStorage.getItem("session_user_id"),
  "user-1",
  "session snapshot is bound to the current user"
);

const firstSessionId = sessionStorage.getItem("session_id");
const secondSessionId = ensureSessionSnapshot("user-2");
assert.notEqual(
  secondSessionId,
  firstSessionId,
  "ensureSessionSnapshot() rotates when the authenticated user changes"
);

const migratedLegacyItems = validateQueueSession(
  [{ id: "legacy-1", userId: "user-2", payload: { legacy: true } }],
  secondSessionId
);
assert.equal(
  migratedLegacyItems[0].sessionId,
  secondSessionId,
  "validateQueueSession() migrates legacy queued items without sessionId"
);

assert.deepEqual(
  validateQueueSession(
    [{ id: "stale-1", userId: "user-2", sessionId: "old-session" }],
    secondSessionId
  ),
  [],
  "validateQueueSession() still rejects stale session snapshots"
);

reset();
localStorage.setItem(
  "eventra_offline_queue",
  JSON.stringify([
    {
      id: "legacy-replay",
      actionType: "REGISTER_EVENT",
      userId: "user-3",
      endpoint: "/api/events/register",
      payload: { eventId: "evt-legacy" },
      retryCount: 0,
    },
  ])
);

let replayedRequest = null;
const replayResult = await processQueue("user-3", async (url, options) => {
  replayedRequest = { url, options };
  return { ok: true, status: 200 };
});

assert.equal(replayResult.processed, 1, "processQueue() processes legacy item after migration");
assert.equal(replayResult.succeeded, 1, "processQueue() succeeds for migrated legacy item");
assert.equal(replayedRequest.url, "/api/events/register", "legacy item is replayed to its endpoint");
assert.deepEqual(getQueue(), [], "processQueue() clears queue after successful replay");

// ── pushToQueue queue-limit enforcement ─────────────────────────────────────
reset();
// Pre-fill exactly 15 items directly in localStorage (the module's limit is 15)
const fullQueue = Array.from({ length: 15 }, (_, i) => ({ eventId: `e${i}` }));
global.localStorage.setItem(
  "eventra_offline_queue",
  JSON.stringify(fullQueue)
);
assert.equal(getQueue().length, 15, "storage pre-filled to 15 items");

// Attempt to push a 16th item — should be silently dropped
const result = await pushToQueue({ eventId: "overflow" });
assert.equal(result, false, "pushToQueue() returns false when queue is full");
assert.equal(getQueue().length, 15, "queue length stays at 15 after overflow push");
assert.ok(
  !getQueue().some((x) => x.eventId === "overflow"),
  "overflow item is NOT stored"
);

// ── setQueue ────────────────────────────────────────────────────────────────
reset();
await setQueue([{ eventId: "a" }, { eventId: "b" }]);
// setQueue is async (IndexedDB), but the localStorage mirror is sync
assert.equal(getQueue().length, 2, "setQueue() writes two items to localStorage mirror");
assert.equal(getQueue()[0].eventId, "a", "setQueue() preserves item order");

reset();
global.localStorage.setItem(
  "eventra_offline_queue",
  JSON.stringify([{ eventId: "stale" }])
);
await setQueue([]);
assert.deepEqual(
  getQueue(),
  [],
  "setQueue([]) clears the queue"
);
assert.equal(
  global.localStorage.getItem("eventra_offline_queue"),
  null,
  "setQueue([]) removes the localStorage key"
);

// ── clearQueue ───────────────────────────────────────────────────────────────
reset();
global.localStorage.setItem(
  "eventra_offline_queue",
  JSON.stringify([{ eventId: "x" }])
);
await clearQueue();
assert.deepEqual(getQueue(), [], "clearQueue() empties the queue");
assert.equal(
  global.localStorage.getItem("eventra_offline_queue"),
  null,
  "clearQueue() removes the localStorage key"
);

console.log("All offlineQueue tests passed ✓");
