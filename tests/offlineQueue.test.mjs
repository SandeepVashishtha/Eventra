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

// Stub out window.indexedDB so openDB() rejects cleanly
global.window = {
  indexedDB: null,
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
const { getQueue, pushToQueue, setQueue, clearQueue } = await import(
  "../src/utils/offlineQueue.js"
);

// ── Helper ──────────────────────────────────────────────────────────────────
function reset() {
  localStorage.clear();
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
