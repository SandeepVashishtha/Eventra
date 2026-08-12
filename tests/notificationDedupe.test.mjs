/**
 * Unit tests for the SSE / poller notification dedupe convergence (issue
 * #14612).
 *
 * Before the fix, the SSE path (NotificationContext.normalizeNotification)
 * derived an id for id-less notifications from `getNotificationMessage(n)`
 * while the poller (useNotificationPoller.normalize) synthesized one from
 * Math.random(). The same logical notification delivered over both transports
 * therefore produced two different ids, so the poller's seen-id + merge
 * dedupe never matched and unreadCount inflated.
 *
 * Both normalizers now derive ids from the shared
 * getNotificationDedupeKey() helper, and the poller recomputes unreadCount
 * from the deduped set instead of incrementing it per new arrival.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const { getNotificationDedupeKey } = await import("../src/utils/notificationPreferences.js");

const __dirname = dirname(fileURLToPath(import.meta.url));

// Minimal replica of the merge applied by useNotificationPoller.applyList:
// dedupe the batch by canonical id, merge against the freshest list, keep
// newest-first, and derive unreadCount from the deduped set.
function createInbox() {
  let current = [];
  const seenIds = new Set();
  return {
    applyList(list) {
      const byId = new Map();
      const deduped = [];
      for (const raw of list) {
        // Mirror useNotificationPoller.normalize: id-less payloads get the
        // canonical dedupe key.
        const n = { ...raw, id: raw.id || getNotificationDedupeKey(raw) };
        if (byId.has(n.id)) continue;
        byId.set(n.id, n);
        deduped.push(n);
      }
      deduped.forEach((n) => seenIds.add(n.id));
      const prev = current;
      const merged = deduped.concat(prev.filter((p) => !byId.has(p.id)));
      current = merged.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return this;
    },
    get list() {
      return current;
    },
    get unreadCount() {
      return current.filter((n) => !n.isRead).length;
    },
    seen(id) {
      return seenIds.has(id);
    },
  };
}

const sseKey = (raw) => getNotificationDedupeKey(raw);
const pollerKey = (raw) => getNotificationDedupeKey(raw);

const idless = {
  eventId: "evt_123",
  title: "Event reminder",
  message: "Starts in 30 minutes",
  timestamp: "2026-08-12T10:00:00.000Z",
  isRead: false,
};

// 1. getNotificationDedupeKey priority and determinism.
assert.equal(getNotificationDedupeKey({ id: "a1", eventId: "e1" }), "a1", "server id wins");
assert.equal(getNotificationDedupeKey({ _id: "a2", eventId: "e2" }), "a2", "_id wins");
assert.equal(getNotificationDedupeKey({ eventId: "e3" }), "event:e3", "eventId keyed");
assert.equal(
  getNotificationDedupeKey(idless),
  "event:evt_123",
  "notification with an eventId is keyed by the event, not random"
);
const contentOnly = { title: "Reminder", message: "Starts in 30 minutes", timestamp: "2026-08-12T10:00:00.000Z" };
assert.equal(
  getNotificationDedupeKey(contentOnly),
  `${contentOnly.timestamp}-${contentOnly.message}`,
  "id-less, event-less notifications get a deterministic timestamp+content key"
);
assert.equal(
  getNotificationDedupeKey(contentOnly),
  getNotificationDedupeKey({ ...contentOnly }),
  "same logical id-less notification always derives the same key"
);
assert.equal(getNotificationDedupeKey({}), "", "empty notification yields empty key");
assert.equal(getNotificationDedupeKey(null), "", "null notification yields empty key");

// 2. SSE then poller: same id-less notification must converge to one entry
//    and a single unread count (the reported bug).
{
  const inbox = createInbox();
  const sseRaw = { ...idless, id: sseKey(idless) };
  inbox.applyList([sseRaw]);
  const pollerRaw = { ...idless, id: pollerKey(idless) };
  inbox.applyList([pollerRaw]);
  assert.equal(inbox.list.length, 1, "SSE + poller duplicate collapses to one entry");
  assert.equal(inbox.unreadCount, 1, "unreadCount is 1, not 2");
  assert.ok(inbox.seen(pollerKey(idless)), "canonical id registered in seen-ids");
}

// 3. Poller then SSE (reverse order) converges the same way.
{
  const inbox = createInbox();
  inbox.applyList([{ ...idless, id: pollerKey(idless) }]);
  inbox.applyList([{ ...idless, id: sseKey(idless) }]);
  assert.equal(inbox.list.length, 1, "reverse order also collapses to one entry");
  assert.equal(inbox.unreadCount, 1, "reverse order unreadCount stays 1");
}

// 4. Server-id notifications delivered over both transports stay single.
{
  const inbox = createInbox();
  const server = { id: "srv_99", title: "T", message: "M", timestamp: "2026-08-12T09:00:00.000Z", isRead: false };
  inbox.applyList([{ ...server }]);
  inbox.applyList([{ ...server }]);
  assert.equal(inbox.list.length, 1, "same server id over both transports is one entry");
  assert.equal(inbox.unreadCount, 1, "server-id duplicate counted once");
}

// 5. Distinct notifications (different events / different content) are never
//    conflated.
{
  const inbox = createInbox();
  inbox.applyList([{ ...idless, eventId: "evt_1", message: "First message", timestamp: "2026-08-12T08:00:00.000Z" }]);
  inbox.applyList([{ ...idless, eventId: "evt_2", message: "Second message", timestamp: "2026-08-12T09:00:00.000Z" }]);
  assert.equal(inbox.list.length, 2, "different events stay separate");
  assert.equal(inbox.unreadCount, 2, "two distinct unread notifications counted");
  assert.equal(
    inbox.list[0].id,
    "event:evt_2",
    "keys are event-scoped so a later notification for the same event replaces the slot"
  );
}

// 6. A duplicate inside a single batch is collapsed by the batch-level dedupe.
{
  const inbox = createInbox();
  inbox.applyList([{ ...idless, id: sseKey(idless) }, { ...idless, id: pollerKey(idless) }]);
  assert.equal(inbox.list.length, 1, "intra-batch duplicate collapses to one entry");
  assert.equal(inbox.unreadCount, 1, "intra-batch duplicate counted once");
}

// 7. After marking read locally, a re-poll (server reflects isRead: true)
//    keeps the single entry and does not resurrect unread state.
{
  const inbox = createInbox();
  inbox.applyList([{ ...idless, id: sseKey(idless) }]);
  inbox.list[0] = { ...inbox.list[0], isRead: true };
  inbox.applyList([{ ...idless, id: pollerKey(idless), isRead: true }]);
  assert.equal(inbox.list.length, 1, "re-poll after read keeps single entry");
  assert.equal(inbox.unreadCount, 0, "read notification is not recounted as unread");
}

// 8. Source contract: both transports must actually derive ids from the
//    shared helper, and the poller must recompute unread from the deduped set.
const contextSrc = readFileSync(join(__dirname, "../src/context/NotificationContext.js"), "utf8");
const pollerSrc = readFileSync(join(__dirname, "../src/hooks/useNotificationPoller.js"), "utf8");
assert.ok(
  contextSrc.includes("getNotificationDedupeKey") &&
    /id:\s*getNotificationDedupeKey\(n\)/.test(contextSrc),
  "NotificationContext.normalizeNotification derives id from the shared key"
);
assert.ok(
  pollerSrc.includes("getNotificationDedupeKey") &&
    /id:\s*getNotificationDedupeKey\(n\)/.test(pollerSrc),
  "useNotificationPoller.normalize derives id from the shared key"
);
assert.ok(
  /setUnreadCount\(Math\.max\(0, sorted\.filter\(\(n\) => !n\.isRead\)\.length\)\)/.test(pollerSrc),
  "poller recomputes unreadCount from the deduped set"
);

console.log("All notification dedupe convergence tests passed");
