import assert from "node:assert/strict";

// ── Mock DOM & Storage Globals ──────────────────────────────────────────────
const _lsStore = {};
globalThis.localStorage = {
  getItem: (key) => (key in _lsStore ? _lsStore[key] : null),
  setItem: (key, val) => {
    _lsStore[key] = String(val);
  },
  removeItem: (key) => {
    delete _lsStore[key];
  },
  clear: () => {
    for (const k of Object.keys(_lsStore)) {
      delete _lsStore[k];
    }
  }
};

// Isolated in-memory IDB store for mockIdbKeyval
globalThis._mockIdbStore = {};

// Mock window and CustomEvent
globalThis.window = {
  dispatchEvent: (event) => {},
};
globalThis.CustomEvent = class CustomEvent {
  constructor(type, detail) {
    this.type = type;
    this.detail = detail;
  }
};

// ── Import under test after stubbing globals ────────────────────────────────
const { addRegistrationToUserStorage, promoteRecord, getGlobalWaitlist } = await import("../src/utils/waitlistUtils.js");
const { reconcileRegistrations, loadFromIDB } = await import("../src/context/MyEventsContext.js");

const resetAll = () => {
  localStorage.clear();
  globalThis._mockIdbStore = {};
};

console.log("Running Registration Storage Sync unit tests...");

// Test 1: Normal registration writes to IndexedDB
{
  resetAll();
  const userId = "user-123";
  const event = { id: 42, title: "Normal Event", date: "2026-06-12", location: "Online" };
  
  await addRegistrationToUserStorage(userId, event);
  
  // Verify it exists in IndexedDB
  const idbRegs = globalThis._mockIdbStore[`my_events_${userId}`];
  assert.ok(idbRegs);
  assert.equal(idbRegs.length, 1);
  assert.equal(idbRegs[0].eventId, 42);
  console.log("✓ Test 1: Normal registration writes to IndexedDB");
}

// Test 2: Waitlist promotion writes to IndexedDB
{
  resetAll();
  const userId = "user-promotion";
  const event = { id: 99, title: "Promoted Event", date: "2026-06-12", location: "Physical" };
  const waitlistRecord = { userId, eventId: 99, status: "waiting", joinedAt: new Date().toISOString() };
  
  // Set global waitlist with the record
  const records = [waitlistRecord];
  localStorage.setItem("eventra_global_waitlists", JSON.stringify(records));
  
  const success = await promoteRecord(waitlistRecord, event);
  assert.ok(success);
  
  // Verify it exists in IndexedDB
  const idbRegs = globalThis._mockIdbStore[`my_events_${userId}`];
  assert.ok(idbRegs);
  assert.equal(idbRegs.length, 1);
  assert.equal(idbRegs[0].eventId, 99);
  
  // Verify waitlist status is updated
  const updatedRecords = getGlobalWaitlist();
  assert.equal(updatedRecords[0].status, "promoted");
  console.log("✓ Test 2: Waitlist promotion writes to IndexedDB");
}

// Test 3: Dashboard read consistency (loadFromIDB)
{
  resetAll();
  const userId = "user-dashboard";
  const eventRecord = {
    eventId: 77,
    registeredAt: new Date().toISOString(),
    eventSummary: { id: 77, title: "Saved Event" }
  };
  
  // Set in IndexedDB directly
  globalThis._mockIdbStore[`my_events_${userId}`] = [eventRecord];
  
  const loaded = await loadFromIDB(userId);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].eventId, 77);
  console.log("✓ Test 3: Dashboard read consistency");
}

// Test 4: Duplicate prevention
{
  resetAll();
  const userId = "user-dup";
  const event = { id: 55, title: "Duplicate Event" };
  
  // Register once
  await addRegistrationToUserStorage(userId, event);
  // Register twice
  await addRegistrationToUserStorage(userId, event);
  
  // Verify only 1 record exists in IndexedDB
  const idbRegs = globalThis._mockIdbStore[`my_events_${userId}`];
  assert.equal(idbRegs.length, 1);
  console.log("✓ Test 4: Duplicate prevention");
}

// Test 5: Migration correctness (merge localStorage into IndexedDB on load)
{
  resetAll();
  const userId = "user-migrate";
  const legacyRecord = {
    eventId: 10,
    registeredAt: "2026-06-11T12:00:00Z",
    eventSummary: { id: 10, title: "Legacy Event" }
  };
  
  // Set in localStorage (legacy/diverged)
  localStorage.setItem(`my_events_${userId}`, JSON.stringify([legacyRecord]));
  
  // Load using loadFromIDB (should migrate)
  const loaded = await loadFromIDB(userId);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].eventId, 10);
  
  // Verify it is now in IndexedDB
  const idbRegs = globalThis._mockIdbStore[`my_events_${userId}`];
  assert.equal(idbRegs.length, 1);
  assert.equal(idbRegs[0].eventId, 10);
  
  // Verify localStorage is cleaned up
  assert.equal(localStorage.getItem(`my_events_${userId}`), null);
  console.log("✓ Test 5: Migration correctness");
}

// Test 6: Reconciliation behavior (timestamp comparison)
{
  resetAll();
  const userId = "user-reconcile";
  const olderRecord = {
    eventId: 12,
    registeredAt: "2026-06-10T12:00:00Z",
    eventSummary: { id: 12, title: "Older Event Title" }
  };
  const newerRecord = {
    eventId: 12,
    registeredAt: "2026-06-12T12:00:00Z",
    eventSummary: { id: 12, title: "Newer Event Title" }
  };
  
  // Put older in IndexedDB, newer in localStorage
  globalThis._mockIdbStore[`my_events_${userId}`] = [olderRecord];
  localStorage.setItem(`my_events_${userId}`, JSON.stringify([newerRecord]));
  
  // Load and reconcile
  const loaded = await loadFromIDB(userId);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].eventSummary.title, "Newer Event Title"); // Should keep newer
  
  // Verify localStorage is cleared
  assert.equal(localStorage.getItem(`my_events_${userId}`), null);
  console.log("✓ Test 6: Reconciliation behavior");
}

console.log("All Registration Storage Sync unit tests passed successfully! ✓");
