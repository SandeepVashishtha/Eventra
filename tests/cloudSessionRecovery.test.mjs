import { strict as assert } from "node:assert";
import { API_ENDPOINTS, apiUtils } from "../src/config/api.js";
import {
  createRecoveryPayload,
  isRecoverySessionExpired,
  mergeRecoverySessions,
  normalizeRecoverySession,
  queuePendingRecoverySession,
  readPendingRecoveryQueue,
  readRecoverySessionsFromStorage,
  resolveRecoveryConflict,
  syncPendingRecoverySessions,
  writeRecoverySessionsToStorage,
} from "../src/services/sessionRecoveryService.js";

import {
  assertOwner,
  getStore,
  isExpired,
  normalizeSession,
} from "../api/lib/sessionRecoveryStore.js";

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
};

const now = new Date("2026-06-05T10:00:00.000Z");

console.log("cloudSessionRecovery tests starting...");

// Session creation with sanitization and expiration.
const payload = createRecoveryPayload({
  userId: "user-1",
  type: "event-creation",
  state: {
    title: "GSSoC Meetup",
    token: "secret-token",
    step: 2,
  },
  now,
});

assert.equal(payload.userId, "user-1");
assert.equal(payload.type, "event-creation");
assert.equal(payload.draftData.token, "[REDACTED]");
assert.equal(payload.lastUpdated, "2026-06-05T10:00:00.000Z");
assert.equal(payload.expiresAt, "2026-06-12T10:00:00.000Z");

// Session updates/conflict resolution choose newest device copy.
const older = normalizeRecoverySession({
  ...payload,
  draftData: { title: "Old" },
  lastUpdated: "2026-06-05T09:00:00.000Z",
});
const newer = normalizeRecoverySession({
  ...payload,
  draftData: { title: "New" },
  lastUpdated: "2026-06-05T11:00:00.000Z",
});
assert.equal(resolveRecoveryConflict(older, newer).draftData.title, "New");
assert.equal(mergeRecoverySessions([older], [newer]).length, 1);

// Expiration handling removes old sessions.
assert.equal(
  isRecoverySessionExpired(
    { ...payload, expiresAt: "2026-06-01T00:00:00.000Z" },
    now.getTime(),
  ),
  true,
);

// Persistence and corrupted storage recovery.
const storage = createStorage();
writeRecoverySessionsToStorage([payload], storage, "cache");
assert.equal(readRecoverySessionsFromStorage(storage, "cache").length, 1);
storage.setItem("cache", "{bad json");
assert.deepEqual(readRecoverySessionsFromStorage(storage, "cache"), []);
assert.equal(storage.has("cache"), true, "safe parser fallback leaves key untouched but returns empty data");

// Offline queue stores pending drafts.
const queued = queuePendingRecoverySession(payload, storage, "pending");
assert.equal(queued.length, 1);
assert.equal(readPendingRecoveryQueue(storage, "pending").length, 1);

// Offline synchronization flushes successful saves and leaves failures queued.
const originalPost = apiUtils.post;
let savedPayload = null;
apiUtils.post = async (url, data) => {
  assert.equal(url, API_ENDPOINTS.SESSION_RECOVERY.BASE);
  savedPayload = data;
  return { data };
};

storage.setItem("eventra:cloud-session-recovery:pending:v1", JSON.stringify([payload]));
const syncResult = await syncPendingRecoverySessions(storage);
assert.equal(syncResult.synced.length, 1);
assert.equal(syncResult.failed.length, 0);
assert.equal(savedPayload.sessionId, payload.sessionId);
assert.deepEqual(readPendingRecoveryQueue(storage), []);

apiUtils.post = async () => {
  throw new Error("offline");
};
storage.setItem("eventra:cloud-session-recovery:pending:v1", JSON.stringify([payload]));
const failedSync = await syncPendingRecoverySessions(storage);
assert.equal(failedSync.synced.length, 0);
assert.equal(failedSync.failed.length, 1);
assert.equal(readPendingRecoveryQueue(storage).length, 1);
apiUtils.post = originalPost;

// Server-side ownership validation and expiration contracts.
const serverSession = normalizeSession(
  {
    sessionId: "abc123",
    userId: "attacker-supplied",
    type: "profile-edit",
    draftData: { displayName: "Alice" },
    lastUpdated: "2026-06-05T10:00:00.000Z",
  },
  "owner-1",
);

assert.equal(serverSession.userId, "owner-1", "server derives owner from auth context");
assert.equal(assertOwner(serverSession, "owner-1"), true);
assert.equal(assertOwner(serverSession, "owner-2"), false);
assert.equal(
  isExpired({ ...serverSession, expiresAt: "2026-06-01T00:00:00.000Z" }, now.getTime()),
  true,
);

const store = getStore();
store.clear();
store.set(serverSession.sessionId, serverSession);
assert.equal(store.get("abc123").draftData.displayName, "Alice");

console.log("cloudSessionRecovery tests passed");
