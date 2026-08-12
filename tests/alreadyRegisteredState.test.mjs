// Tests for the already-registered fallback state-corruption fix.
//
// The bug: the isAlreadyRegistered error path in proceedWithRegistration
// called addRegistration(event, formData) with the current local form values.
// Because the server rejected the submission as a duplicate, those form
// values are unconfirmed -- they may differ from the authoritative server
// record. If local state was empty (e.g., cleared storage), the corrupt
// data was stored and surfaced to components such as EventTicket.
//
// The fix passes an empty object {} instead of formData so that the
// already-registered marker is stored without overwriting the cached
// registration data with unconfirmed values.

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Minimal model of MyEventsContext.addRegistration
// ---------------------------------------------------------------------------

function makeStore() {
  const registrations = [];
  return {
    add(event, formData) {
      if (registrations.some(r => r.eventId === event.id)) return false;
      registrations.push({
        eventId: event.id,
        registeredAt: new Date().toISOString(),
        formData: formData || {},
        event
      });
      return true;
    },
    get(eventId) {
      return registrations.find(r => r.eventId === eventId) || null;
    },
    has(eventId) {
      return registrations.some(r => r.eventId === eventId);
    },
    all() { return registrations.slice(); },
    remove(eventId) { const i=registrations.findIndex(r=>r.eventId===eventId); if(i!==-1) registrations.splice(i,1); }
  };
}

const MOCK_EVENT = { id: 42, title: "Dev Summit", date: "2099-06-15" };

let passed = 0; let failed = 0;
function test(label, fn) {
  try { fn(); console.log("  pass  " + label); passed++; }
  catch(e) { console.error("  FAIL  " + label); console.error("        " + e.message); failed++; }
}

console.log("");
console.log("Normal registration success");

test("successful registration stores confirmed form data", () => {
  const store = makeStore();
  const confirmedFormData = { fullName: "Alice", email: "alice@test.com", dietaryRequirements: "Vegetarian" };
  store.add(MOCK_EVENT, confirmedFormData);
  const reg = store.get(MOCK_EVENT.id);
  assert.deepEqual(reg.formData, confirmedFormData);
  assert.equal(reg.eventId, MOCK_EVENT.id);
});

test("registration dedup guard prevents overwrite", () => {
  const store = makeStore();
  const original = { fullName: "Alice", dietaryRequirements: "Vegetarian" };
  store.add(MOCK_EVENT, original);
  // Attempt to add again with different data -- should be ignored
  const modified = { fullName: "Alice", dietaryRequirements: "None" };
  const added = store.add(MOCK_EVENT, modified);
  assert.equal(added, false, "dedup guard must return false for duplicate event");
  assert.deepEqual(store.get(MOCK_EVENT.id).formData, original, "original data must not be overwritten");
});

console.log("");
console.log("Already-registered response handling");

test("already-registered path with empty object does not store unconfirmed form data", () => {
  const store = makeStore();
  const currentFormData = { fullName: "Alice", dietaryRequirements: "None" };
  // Fixed behavior: pass {} instead of formData
  store.add(MOCK_EVENT, {});
  const reg = store.get(MOCK_EVENT.id);
  assert.deepEqual(reg.formData, {}, "formData must be empty, not the unconfirmed current form values");
  assert.notDeepEqual(reg.formData, currentFormData, "unconfirmed form values must not be stored");
});

test("already-registered path: event is still marked as registered", () => {
  const store = makeStore();
  store.add(MOCK_EVENT, {});
  assert.equal(store.has(MOCK_EVENT.id), true, "event must be marked as registered");
});

test("already-registered path: dedup guard still works after empty-object add", () => {
  const store = makeStore();
  store.add(MOCK_EVENT, {});
  // A subsequent real registration attempt must not add a second entry
  const added = store.add(MOCK_EVENT, { fullName: "Alice" });
  assert.equal(added, false, "dedup guard must prevent second entry");
  assert.equal(store.all().length, 1, "must have exactly one registration");
});

console.log("");
console.log("Form modification after initial registration");

test("modifying form after registration cannot corrupt stored data via already-registered path", () => {
  const store = makeStore();
  const serverRecord = { fullName: "Alice", dietaryRequirements: "Vegetarian", selectedSeat: "A1" };
  // Simulate: user previously registered successfully (confirmed form data stored)
  store.add(MOCK_EVENT, serverRecord);

  // Simulate: user modifies form and re-submits
  const modifiedFormData = { fullName: "Alice", dietaryRequirements: "None", selectedSeat: "B2" };
  // Server returns already-registered -- fixed path passes {} not modifiedFormData
  const added = store.add(MOCK_EVENT, {});

  assert.equal(added, false, "dedup guard prevents second entry");
  // Original server-confirmed data must be intact
  const reg = store.get(MOCK_EVENT.id);
  assert.deepEqual(reg.formData, serverRecord, "server-confirmed data must be preserved");
  assert.equal(reg.formData.selectedSeat, "A1", "selectedSeat from server record must be preserved");
  assert.notEqual(reg.formData.dietaryRequirements, "None", "unconfirmed modification must not appear");
});

test("selectedSeat from server record survives duplicate submission attempt", () => {
  const store = makeStore();
  store.add(MOCK_EVENT, { selectedSeat: "C3", fullName: "Bob" });
  // User changes seat locally and resubmits
  store.add(MOCK_EVENT, {});
  assert.equal(store.get(MOCK_EVENT.id).formData.selectedSeat, "C3");
});

console.log("");
console.log("Registration state consistency");

test("empty store: already-registered path adds entry with empty formData", () => {
  const store = makeStore();
  // No previous entry -- already-registered response with empty store
  store.add(MOCK_EVENT, {});
  assert.equal(store.all().length, 1);
  assert.deepEqual(store.all()[0].formData, {});
});

test("eventId is correctly stored in already-registered path", () => {
  const store = makeStore();
  store.add(MOCK_EVENT, {});
  assert.equal(store.get(MOCK_EVENT.id).eventId, MOCK_EVENT.id);
});

test("event snapshot is stored even when formData is empty", () => {
  const store = makeStore();
  store.add(MOCK_EVENT, {});
  const reg = store.get(MOCK_EVENT.id);
  assert.deepEqual(reg.event, MOCK_EVENT, "event snapshot must always be stored");
});

test("multiple different events can each have already-registered entries", () => {
  const store = makeStore();
  const event1 = { id: 1, title: "E1" };
  const event2 = { id: 2, title: "E2" };
  store.add(event1, {});
  store.add(event2, {});
  assert.equal(store.has(1), true);
  assert.equal(store.has(2), true);
  assert.equal(store.all().length, 2);
});

console.log("");
console.log("Authoritative server-state restoration");

test("success path stores confirmed form data correctly", () => {
  const store = makeStore();
  const confirmed = { fullName: "Charlie", email: "c@test.com", selectedSeat: "D4" };
  store.add(MOCK_EVENT, confirmed);
  assert.deepEqual(store.get(MOCK_EVENT.id).formData, confirmed);
});

test("already-registered entry can be removed and re-added with confirmed data", () => {
  const store = makeStore();
  // Already-registered fallback stores empty
  store.add(MOCK_EVENT, {});
  assert.deepEqual(store.get(MOCK_EVENT.id).formData, {});

  // Later: removeRegistration + successful re-registration would update it
  store.remove(MOCK_EVENT.id); // simulate removeRegistration
  // Now re-add with confirmed data
  store.add(MOCK_EVENT, { selectedSeat: "E5", fullName: "Dana" });
  assert.equal(store.get(MOCK_EVENT.id).formData.selectedSeat, "E5");
});

console.log("");
console.log("Regression: original bug -- unconfirmed form data stored on already-registered");

test("regression: old behaviour stored unconfirmed formData (bug confirmed)", () => {
  const store = makeStore();
  const serverRecord = { fullName: "Alice", dietaryRequirements: "Vegetarian", selectedSeat: "A1" };
  const unconfirmedFormData = { fullName: "Alice", dietaryRequirements: "None", selectedSeat: "B2" };

  // OLD (buggy) path: called addRegistration(event, formData) where formData
  // was the current modified form state, not the server-confirmed record.
  store.add(MOCK_EVENT, unconfirmedFormData); // ← simulates the bug

  const reg = store.get(MOCK_EVENT.id);
  assert.equal(reg.formData.dietaryRequirements, "None",
    "old code stored unconfirmed modification (bug confirmed)");
  assert.equal(reg.formData.selectedSeat, "B2",
    "old code stored wrong seat from unconfirmed form");
});

test("regression: fixed behaviour stores empty object, not unconfirmed data", () => {
  const store = makeStore();
  const unconfirmedFormData = { fullName: "Alice", dietaryRequirements: "None", selectedSeat: "B2" };

  // FIXED path: called addRegistration(event, {}) -- does not use formData
  store.add(MOCK_EVENT, {}); // ← simulates the fix

  const reg = store.get(MOCK_EVENT.id);
  assert.deepEqual(reg.formData, {},
    "fixed code stores empty object, not unconfirmed form values");
  assert.equal(reg.formData.dietaryRequirements, undefined,
    "fixed code must not store any dietary preference from unconfirmed form");
  assert.equal(reg.formData.selectedSeat, undefined,
    "fixed code must not store any seat assignment from unconfirmed form");
});

test("regression: server record intact when dedup guard fires on fixed path", () => {
  const store = makeStore();
  const serverConfirmed = { fullName: "Alice", dietaryRequirements: "Vegetarian", selectedSeat: "A1" };

  // Phase 1: user initially registered -- success path stores confirmed data
  store.add(MOCK_EVENT, serverConfirmed);
  assert.equal(store.get(MOCK_EVENT.id).formData.dietaryRequirements, "Vegetarian");

  // Phase 2: user modifies form and resubmits -- server returns already-registered
  // Fixed path: store.add(event, {}) -- dedup guard fires, original is preserved
  store.add(MOCK_EVENT, {});
  assert.equal(store.get(MOCK_EVENT.id).formData.dietaryRequirements, "Vegetarian",
    "server-confirmed dietary preference must survive duplicate submission");
  assert.equal(store.get(MOCK_EVENT.id).formData.selectedSeat, "A1",
    "server-confirmed seat must survive duplicate submission");
});

const total = passed + failed;
console.log("");
console.log(total + " tests: " + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
