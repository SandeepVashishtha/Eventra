import test from "node:test";
import assert from "node:assert/strict";
import {
  createSession,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  touchSession,
  isSessionExpired,
} from "../api/lib/sessionStore.js";

test("createSession tracks device metadata and marks first login as non-suspicious", () => {
  const session = createSession("user-1", {
    userAgent: "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0",
    deviceFingerprint: "fp-1",
  });

  assert.equal(session.userId, "user-1");
  assert.equal(session.browser, "Chrome");
  assert.equal(session.os, "Windows");
  assert.equal(session.suspicious, false);
});

test("second device login is flagged as suspicious", () => {
  createSession("user-2", { deviceFingerprint: "fp-a" });
  const second = createSession("user-2", { deviceFingerprint: "fp-b" });

  assert.equal(second.suspicious, true);
});

test("getUserSessions marks current session", () => {
  const first = createSession("user-3", { deviceFingerprint: "fp-x" });
  createSession("user-3", { deviceFingerprint: "fp-y" });

  const sessions = getUserSessions("user-3", first.id);
  assert.equal(sessions.length, 2);
  assert.equal(sessions.find((s) => s.id === first.id)?.isCurrent, true);
});

test("revokeSession removes session from active list", () => {
  const session = createSession("user-4", { deviceFingerprint: "fp-z" });
  const result = revokeSession(session.id, "user-4");

  assert.equal(result.ok, true);
  assert.equal(getUserSessions("user-4").length, 0);
});

test("revokeAllSessions keeps current session when exceptSessionId is provided", () => {
  const current = createSession("user-5", { deviceFingerprint: "fp-1" });
  createSession("user-5", { deviceFingerprint: "fp-2" });

  const { revokedCount } = revokeAllSessions("user-5", current.id);
  const remaining = getUserSessions("user-5");

  assert.equal(revokedCount, 1);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, current.id);
});

test("touchSession updates lastActiveAt", async () => {
  const session = createSession("user-6", { deviceFingerprint: "fp-touch" });
  const before = session.lastActiveAt;

  await new Promise((resolve) => setTimeout(resolve, 5));
  const updated = touchSession(session.id);
  assert.ok(updated);
  assert.ok(new Date(updated.lastActiveAt).getTime() >= new Date(before).getTime());
});

test("isSessionExpired returns true for past expiry", () => {
  const session = createSession("user-7", { deviceFingerprint: "fp-exp" });
  session.expiresAt = new Date(Date.now() - 1000).toISOString();
  assert.equal(isSessionExpired(session), true);
});
