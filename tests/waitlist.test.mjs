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

// Mock IndexedDB so idb-keyval runs in Node.js
const _idbStore = {};
globalThis.indexedDB = {
  open(name, version) {
    const db = {
      transaction(storeNames, mode) {
        const tx = {};
        const store = {
          transaction: tx,
          get(key) {
            const req = { result: _idbStore[key] };
            setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
            return req;
          },
          put(val, key) {
            _idbStore[key] = val;
            const req = { result: key };
            setTimeout(() => { if (req.onsuccess) req.onsuccess(); }, 0);
            return req;
          }
        };
        tx.objectStore = (name) => store;
        setTimeout(() => {
          if (tx.oncomplete) tx.oncomplete();
          else if (tx.onsuccess) tx.onsuccess();
        }, 0);
        return tx;
      }
    };
    const request = {
      result: db
    };
    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.result.createObjectStore = () => {};
        request.onupgradeneeded();
      }
      if (request.onsuccess) request.onsuccess();
    }, 0);
    return request;
  }
};

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

// ── Import waitlistUtils after stubbing globals ──────────────────────────────
const {
  getGlobalWaitlist,
  saveGlobalWaitlist,
  getEventWaitlist,
  getQueuePosition,
  joinWaitlist,
  leaveWaitlist,
  promoteRecord,
  promoteNextUser,
  handleCapacityIncrease,
  organizerRemoveUser,
} = await import("../src/utils/waitlistUtils.js");

// ── Test Helpers ─────────────────────────────────────────────────────────────
const resetAll = () => {
  localStorage.clear();
  for (const k of Object.keys(_idbStore)) delete _idbStore[k];
};

console.log("Running Waitlist System unit tests...");

// 1. Join Waitlist Success
{
  resetAll();
  const eventId = 1;
  const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };
  const form = { phone: "123456", eventTitle: "React Conf" };

  const entry = await joinWaitlist(eventId, user, form);
  assert.equal(entry.userId, "user-1");
  assert.equal(entry.eventId, 1);
  assert.equal(entry.status, "waiting");
  assert.ok(entry.joinedAt);

  const list = getEventWaitlist(eventId);
  assert.equal(list.length, 1);
  assert.equal(list[0].userId, "user-1");
  console.log("✓ Test 1: Join Waitlist Success");
}

// 2. Join Waitlist Duplicates Blocked
{
  resetAll();
  const eventId = 1;
  const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };

  await joinWaitlist(eventId, user, {});
  await assert.rejects(
    async () => {
      await joinWaitlist(eventId, user, {});
    },
    /already on the waitlist/
  );
  console.log("✓ Test 2: Join Waitlist Duplicates Blocked");
}

// 3. Registered Users Cannot Join Waitlist
{
  resetAll();
  const eventId = 1;
  const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };

  // Set user as registered in localStorage
  localStorage.setItem(`my_events_${user.id}`, JSON.stringify([{ eventId }]));

  await assert.rejects(
    async () => {
      await joinWaitlist(eventId, user, {});
    },
    /already registered/
  );
  console.log("✓ Test 3: Registered Users Cannot Join Waitlist");
}

// 4. Queue Position Calculation
{
  resetAll();
  const eventId = 1;
  const u1 = { id: "u-1", email: "u1@example.com", fullName: "U1" };
  const u2 = { id: "u-2", email: "u2@example.com", fullName: "U2" };

  await joinWaitlist(eventId, u1, {});
  await joinWaitlist(eventId, u2, {});

  assert.equal(getQueuePosition(eventId, "u-1"), 1);
  assert.equal(getQueuePosition(eventId, "u-2"), 2);
  assert.equal(getQueuePosition(eventId, "u-3"), -1);
  console.log("✓ Test 4: Queue Position Calculation");
}

// 5. Leave Waitlist
{
  resetAll();
  const eventId = 1;
  const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };

  await joinWaitlist(eventId, user, {});
  const success = await leaveWaitlist(eventId, user.id);
  assert.ok(success);

  const list = getEventWaitlist(eventId);
  assert.equal(list.length, 0); // No longer active ('waiting')

  const rawList = getGlobalWaitlist();
  assert.equal(rawList[0].status, "removed");
  console.log("✓ Test 5: Leave Waitlist");
}

// 6. Promote Next User on Cancellation
{
  resetAll();
  const eventId = 2;
  const event = { id: eventId, title: "Web Dev Workshop", maxAttendees: 5, attendees: 5 };
  
  const u1 = { id: "u-1", email: "u1@example.com", fullName: "User One" };
  await joinWaitlist(eventId, u1, {});

  // Simulate cancellation (which triggers promoteNextUser internally)
  const promoted = await promoteNextUser(eventId, event);
  assert.ok(promoted);
  assert.equal(promoted.userId, "u-1");
  assert.equal(promoted.status, "promoted");

  // Check the user was registered
  const userRegs = JSON.parse(localStorage.getItem(`my_events_${u1.id}`));
  assert.equal(userRegs.length, 1);
  assert.equal(userRegs[0].eventId, eventId);
  console.log("✓ Test 6: Promote Next User on Cancellation");
}

// 7. Auto-Promotion on Capacity Increase
{
  resetAll();
  const eventId = 3;
  const event = { id: eventId, title: "DevOps Summit", maxAttendees: 10, attendees: 10 };

  const u1 = { id: "u-1", email: "u1@example.com", fullName: "User One" };
  const u2 = { id: "u-2", email: "u2@example.com", fullName: "User Two" };
  await joinWaitlist(eventId, u1, {});
  await joinWaitlist(eventId, u2, {});

  // Increase capacity by 2
  const promotedCount = await handleCapacityIncrease(event, 12);
  assert.equal(promotedCount, 2);

  const waitlist = getEventWaitlist(eventId);
  assert.equal(waitlist.length, 0); // Both promoted

  const all = getGlobalWaitlist();
  assert.equal(all.filter(r => r.status === "promoted").length, 2);
  console.log("✓ Test 7: Auto-Promotion on Capacity Increase");
}

// 8. Organizer Manual User Removal
{
  resetAll();
  const eventId = 1;
  const user = { id: "user-1", email: "user1@example.com", fullName: "User One" };

  await joinWaitlist(eventId, user, {});
  const success = await organizerRemoveUser(eventId, user.id);
  assert.ok(success);

  const list = getEventWaitlist(eventId);
  assert.equal(list.length, 0);

  const all = getGlobalWaitlist();
  assert.equal(all[0].status, "removed");
  console.log("✓ Test 8: Organizer Manual User Removal");
}

console.log("\nAll Waitlist unit tests passed successfully! ✓");
