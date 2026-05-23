import assert from "node:assert/strict";
import { createRequire } from "node:module";

// Minimal localStorage mock for Node environment
const store = new Map();
const localStorageMock = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

globalThis.localStorage = localStorageMock;

const { getQueue, pushToQueue, setQueue, clearQueue } = await import(
  "../src/utils/offlineQueue.js"
);

const QUEUE_KEY = "eventra_offline_queue";

function resetStore() {
  store.clear();
}

// --- getQueue ---

{
  resetStore();
  const result = getQueue();
  assert.deepEqual(result, [], "getQueue returns [] when nothing is stored");
}

{
  resetStore();
  store.set(QUEUE_KEY, "not-json{{");
  const result = getQueue();
  assert.deepEqual(result, [], "getQueue returns [] on malformed JSON");
}

{
  resetStore();
  store.set(QUEUE_KEY, JSON.stringify({ not: "an array" }));
  const result = getQueue();
  assert.deepEqual(result, [], "getQueue returns [] when stored value is not an array");
}

{
  resetStore();
  const item = { eventId: 1, payload: { fullName: "Alice" }, timestamp: Date.now() };
  store.set(QUEUE_KEY, JSON.stringify([item]));
  const result = getQueue();
  assert.equal(result.length, 1, "getQueue returns active items");
  assert.equal(result[0].eventId, 1);
}

{
  resetStore();
  const expired = {
    eventId: 2,
    payload: { fullName: "Bob" },
    timestamp: Date.now() - 25 * 60 * 60 * 1000,
  };
  store.set(QUEUE_KEY, JSON.stringify([expired]));
  const result = getQueue();
  assert.deepEqual(result, [], "getQueue filters out entries older than 24 hours");
  assert.equal(store.has(QUEUE_KEY), false, "expired-only queue removes the key entirely");
}

{
  resetStore();
  const expired = { eventId: 3, payload: {}, timestamp: Date.now() - 25 * 60 * 60 * 1000 };
  const active = { eventId: 4, payload: {}, timestamp: Date.now() };
  store.set(QUEUE_KEY, JSON.stringify([expired, active]));
  const result = getQueue();
  assert.equal(result.length, 1, "getQueue keeps active items after filtering expired ones");
  assert.equal(result[0].eventId, 4);
}

// --- pushToQueue ---

{
  resetStore();
  pushToQueue({ eventId: 10, payload: { fullName: "Carol" } });
  const raw = JSON.parse(store.get(QUEUE_KEY));
  assert.equal(raw.length, 1, "pushToQueue adds an item");
  assert.ok(typeof raw[0].timestamp === "number", "pushToQueue stamps the item with a timestamp");
  assert.equal(raw[0].eventId, 10);
}

{
  resetStore();
  for (let i = 0; i < 5; i++) {
    pushToQueue({ eventId: i, payload: {} });
  }
  pushToQueue({ eventId: 99, payload: {} });
  const raw = JSON.parse(store.get(QUEUE_KEY));
  assert.equal(raw.length, 5, "pushToQueue does not exceed max queue size of 5");
  assert.ok(
    raw.every((item) => item.eventId !== 99),
    "overflow item is dropped, not added"
  );
}

// --- setQueue ---

{
  resetStore();
  setQueue([{ eventId: 20, payload: {} }]);
  const raw = JSON.parse(store.get(QUEUE_KEY));
  assert.equal(raw.length, 1, "setQueue writes provided items");
}

{
  resetStore();
  store.set(QUEUE_KEY, JSON.stringify([{ eventId: 21 }]));
  setQueue([]);
  assert.equal(store.has(QUEUE_KEY), false, "setQueue with empty array removes the key");
}

// --- clearQueue ---

{
  resetStore();
  store.set(QUEUE_KEY, JSON.stringify([{ eventId: 30 }]));
  clearQueue();
  assert.equal(store.has(QUEUE_KEY), false, "clearQueue removes the queue key");
}

{
  resetStore();
  clearQueue();
  assert.equal(store.has(QUEUE_KEY), false, "clearQueue is a no-op when queue is already absent");
}

console.log("All offlineQueue tests passed.");
