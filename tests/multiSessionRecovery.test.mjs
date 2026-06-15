import { strict as assert } from "node:assert";

import {
  cleanupExpiredRecoverySessions,
  createRecoverySession,
  deleteRecoverySessionEntry,
  filterRecoverySessions,
  groupRecoverySessionsByType,
  normalizeMultiSessions,
  readMultiSessions,
  renameRecoverySessionEntry,
  resolveMultiSessionConflict,
  sortRecoverySessions,
  updateRecoverySessionEntry,
  upsertRecoverySession,
  writeMultiSessions,
} from "../src/utils/multiSessionRecovery.js";

const createStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key),
  };
};

const t1 = new Date("2026-06-05T10:00:00.000Z");
const t2 = new Date("2026-06-05T12:15:00.000Z");

console.log("multiSessionRecovery tests starting...");

const eventDraft = createRecoverySession({
  sessionId: "session_123",
  name: "Tech Conference Draft",
  type: "event-creation",
  draftData: { title: "Tech Conference" },
  source: "cloud",
  userId: "user-1",
  now: t1,
});

const profileDraft = createRecoverySession({
  sessionId: "session_456",
  type: "profile-edit",
  draftData: { displayName: "Ada" },
  source: "local",
  userId: "user-1",
  now: t2,
});

assert.equal(eventDraft.id, "session_123");
assert.equal(eventDraft.name, "Tech Conference Draft");
assert.equal(eventDraft.createdAt, "2026-06-05T10:00:00.000Z");
assert.equal(eventDraft.updatedAt, "2026-06-05T10:00:00.000Z");
assert.equal(eventDraft.expiresAt, "2026-06-12T10:00:00.000Z");
assert.equal(profileDraft.name, "Profile Update Draft");

let sessions = normalizeMultiSessions([eventDraft, profileDraft]);
assert.deepEqual(
  sessions.map((session) => session.id),
  ["session_456", "session_123"],
  "sessions are ordered by latest update",
);

sessions = updateRecoverySessionEntry(sessions, "session_123", {
  draftData: { title: "Updated Tech Conference" },
}, { now: t2 });
const updated = sessions.find((session) => session.id === "session_123");
assert.equal(updated.draftData.title, "Updated Tech Conference");
assert.equal(updated.updatedAt, "2026-06-05T12:15:00.000Z");
assert.equal(updated.version, 2);

sessions = renameRecoverySessionEntry(sessions, "session_123", "Renamed Event Draft");
assert.equal(sessions.find((session) => session.id === "session_123").name, "Renamed Event Draft");

const restored = sessions.find((session) => session.id === "session_456");
assert.deepEqual(restored.draftData, { displayName: "Ada" });

sessions = deleteRecoverySessionEntry(sessions, "session_456");
assert.equal(sessions.length, 1);
assert.equal(sessions[0].id, "session_123");

const olderDuplicate = createRecoverySession({
  sessionId: "dup",
  name: "Old",
  draftData: { value: "old" },
  now: t1,
});
const newerDuplicate = createRecoverySession({
  sessionId: "dup",
  name: "New",
  draftData: { value: "new" },
  now: t2,
});
assert.equal(resolveMultiSessionConflict(olderDuplicate, newerDuplicate).draftData.value, "new");
assert.equal(normalizeMultiSessions([olderDuplicate, newerDuplicate]).length, 1);
assert.equal(normalizeMultiSessions([olderDuplicate, newerDuplicate])[0].name, "New");

const expired = {
  ...eventDraft,
  id: "expired",
  sessionId: "expired",
  expiresAt: "2026-06-01T00:00:00.000Z",
};
assert.equal(cleanupExpiredRecoverySessions([eventDraft, expired], t2.getTime()).length, 1);

const storage = createStorage();
writeMultiSessions([eventDraft, profileDraft], storage, "multi");
assert.equal(readMultiSessions(storage, "multi").length, 2);
storage.setItem("multi", "{bad json");
assert.deepEqual(readMultiSessions(storage, "multi"), []);
assert.equal(storage.has("multi"), false);

const localCloud = normalizeMultiSessions([
  { ...eventDraft, source: "local" },
  { ...profileDraft, source: "cloud" },
]);
assert.equal(localCloud.length, 2);
assert.ok(localCloud.some((session) => session.source === "cloud"));

const upserted = upsertRecoverySession([eventDraft], {
  ...eventDraft,
  name: "Upserted",
  updatedAt: "2026-06-05T13:00:00.000Z",
  lastUpdated: "2026-06-05T13:00:00.000Z",
});
assert.equal(upserted.length, 1);
assert.equal(upserted[0].name, "Upserted");

const grouped = groupRecoverySessionsByType([eventDraft, profileDraft]);
assert.equal(grouped["event-creation"].length, 1);
assert.equal(grouped["profile-edit"].length, 1);

assert.equal(filterRecoverySessions([eventDraft, profileDraft], "profile").length, 1);
assert.equal(sortRecoverySessions([eventDraft, profileDraft])[0].id, "session_456");

console.log("multiSessionRecovery tests passed");
