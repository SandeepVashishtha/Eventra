import assert from "node:assert/strict";

if (typeof process !== "undefined") {
  process.env.NODE_ENV = "test";
}

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
  dispatchEvent: () => {},
  location: { href: "http://localhost/" },
};
Object.defineProperty(globalThis, "navigator", {
  value: { onLine: false },
  writable: true,
  configurable: true
});
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

// 5b. Leaving notifies users whose queue position improves
{
  resetAll();
  const eventId = 1;
  const joinedAt = Date.now();
  saveGlobalWaitlist([
    {
      userId: "u-1",
      userName: "User One",
      userEmail: "u1@example.com",
      eventId,
      eventTitle: "React Conf",
      joinedAt: new Date(joinedAt).toISOString(),
      status: "waiting",
    },
    {
      userId: "u-2",
      userName: "User Two",
      userEmail: "u2@example.com",
      eventId,
      eventTitle: "React Conf",
      joinedAt: new Date(joinedAt + 1000).toISOString(),
      status: "waiting",
    },
    {
      userId: "u-3",
      userName: "User Three",
      userEmail: "u3@example.com",
      eventId,
      eventTitle: "React Conf",
      joinedAt: new Date(joinedAt + 2000).toISOString(),
      status: "waiting",
    },
  ]);

  await leaveWaitlist(eventId, "u-1");

  const u2Inbox = JSON.parse(localStorage.getItem("eventra_notification_inbox_u-2"));
  const u3Inbox = JSON.parse(localStorage.getItem("eventra_notification_inbox_u-3"));
  assert.equal(u2Inbox[0].title, "Waitlist Position Updated");
  assert.equal(
    u2Inbox[0].message,
    "Your waitlist position for React Conf moved from #2 to #1!"
  );
  assert.equal(u2Inbox[0].metadata.previousPosition, 2);
  assert.equal(u2Inbox[0].metadata.currentPosition, 1);
  assert.equal(
    u3Inbox[0].message,
    "Your waitlist position for React Conf moved from #3 to #2!"
  );
  console.log("Test 5b: Position change notifications after leave");
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

// 7b. Batch promotion sends one final queue movement notification
{
  resetAll();
  const eventId = 3;
  const event = { id: eventId, title: "DevOps Summit", maxAttendees: 10, attendees: 10 };
  const joinedAt = Date.now();

  saveGlobalWaitlist([1, 2, 3, 4, 5].map((position) => ({
    userId: `u-${position}`,
    userName: `User ${position}`,
    userEmail: `u${position}@example.com`,
    eventId,
    eventTitle: event.title,
    joinedAt: new Date(joinedAt + position).toISOString(),
    status: "waiting",
  })));

  const promotedCount = await handleCapacityIncrease(event, 12);
  assert.equal(promotedCount, 2);

  const u5Inbox = JSON.parse(localStorage.getItem("eventra_notification_inbox_u-5"));
  const movementNotifications = u5Inbox.filter((n) => n.title === "Waitlist Position Updated");
  assert.equal(movementNotifications.length, 1);
  assert.equal(
    movementNotifications[0].message,
    "Your waitlist position for DevOps Summit moved from #5 to #3!"
  );
  assert.equal(movementNotifications[0].metadata.previousPosition, 5);
  assert.equal(movementNotifications[0].metadata.currentPosition, 3);
  console.log("Test 7b: Batch position movement notification");
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
  assert.equal(all[0].status, "removed_by_organizer");
  console.log("✓ Test 8: Organizer Manual User Removal");
}

// 9. Promote Record Online Success
{
  resetAll();
  const eventId = 4;
  const event = { id: eventId, title: "Online Promo Event" };
  const user = { id: "user-9", email: "user9@example.com", fullName: "User Nine" };
  
  const records = [{ userId: user.id, eventId, status: "waiting", joinedAt: new Date().toISOString() }];
  saveGlobalWaitlist(records);

  navigator.onLine = true;

  const { apiUtils } = await import("../src/config/api.js");
  const originalPost = apiUtils.post;
  apiUtils.post = async () => ({ ok: true });

  const success = await promoteRecord(records[0], event);
  assert.ok(success, "promoteRecord should return true on online success");

  const list = getGlobalWaitlist();
  assert.equal(list[0].status, "promoted", "Status should be updated to promoted");

  apiUtils.post = originalPost;
  console.log("✓ Test 9: Promote Record Online Success");
}

// 10. Promote Record Online Server Rejection
{
  resetAll();
  const eventId = 4;
  const event = { id: eventId, title: "Online Rejection Event" };
  const user = { id: "user-10", email: "user10@example.com", fullName: "User Ten" };
  
  const records = [{ userId: user.id, eventId, status: "waiting", joinedAt: new Date().toISOString() }];
  saveGlobalWaitlist(records);

  navigator.onLine = true;

  const { apiUtils } = await import("../src/config/api.js");
  const originalPost = apiUtils.post;
  apiUtils.post = async () => ({ ok: false });

  const success = await promoteRecord(records[0], event);
  assert.equal(success, false, "promoteRecord should return false on online rejection");

  const list = getGlobalWaitlist();
  assert.equal(list[0].status, "waiting", "Status should NOT be changed");

  apiUtils.post = originalPost;
  console.log("✓ Test 10: Promote Record Online Server Rejection");
}

// 11. Promote Record Online Server Error (Throws Exception)
{
  resetAll();
  const eventId = 4;
  const event = { id: eventId, title: "Online Error Event" };
  const user = { id: "user-11", email: "user11@example.com", fullName: "User Eleven" };
  
  const records = [{ userId: user.id, eventId, status: "waiting", joinedAt: new Date().toISOString() }];
  saveGlobalWaitlist(records);

  navigator.onLine = true;

  const { apiUtils } = await import("../src/config/api.js");
  const originalPost = apiUtils.post;
  apiUtils.post = async () => {
    const err = new Error("Internal Server Error");
    err.response = { status: 500 };
    throw err;
  };

  const success = await promoteRecord(records[0], event);
  assert.equal(success, false, "promoteRecord should return false on server error");

  const list = getGlobalWaitlist();
  assert.equal(list[0].status, "waiting", "Status should NOT be changed");

  apiUtils.post = originalPost;
  console.log("✓ Test 11: Promote Record Online Server Error");
}

console.log("\nAll Waitlist unit tests passed successfully! ✓");
