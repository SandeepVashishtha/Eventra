import { getClientIp } from "./getClientIp.js";

const DEFAULT_SESSION_TTL_HOURS = 24 * 7;
const MAX_SESSIONS_PER_USER = 20;

export const getSessionStore = () => {
  if (!global.__eventraAuthSessions) {
    global.__eventraAuthSessions = new Map();
  }
  return global.__eventraAuthSessions;
};

export const getRevokedStore = () => {
  if (!global.__eventraRevokedSessions) {
    global.__eventraRevokedSessions = new Set();
  }
  return global.__eventraRevokedSessions;
};

const createExpiresAt = (hours = DEFAULT_SESSION_TTL_HOURS) => {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const parseUserAgent = (userAgent = "") => {
  const ua = String(userAgent);
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let deviceType = "desktop";

  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Opera|OPR\//i.test(ua)) browser = "Opera";

  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  if (/Mobile|Android/i.test(ua) && !/iPad/i.test(ua)) deviceType = "mobile";
  else if (/iPad|Tablet/i.test(ua)) deviceType = "tablet";

  return { browser, os, deviceType };
};

export const isSessionExpired = (session, now = Date.now()) =>
  session?.expiresAt && new Date(session.expiresAt).getTime() <= now;

export const isSessionRevoked = (sessionId) => getRevokedStore().has(sessionId);

export const assertSessionOwner = (session, userId) =>
  session && String(session.userId) === String(userId);

export const detectSuspiciousLogin = (userId, deviceFingerprint, store) => {
  const knownFingerprints = [...store.values()]
    .filter((s) => String(s.userId) === String(userId) && !isSessionExpired(s))
    .map((s) => s.deviceFingerprint);

  if (knownFingerprints.length === 0) return false;
  return !knownFingerprints.includes(deviceFingerprint);
};

export const createSession = (userId, metadata = {}, req = null) => {
  const store = getSessionStore();
  const now = new Date().toISOString();
  const sessionId =
    metadata.sessionId ||
    `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const userAgent = metadata.userAgent || req?.headers?.["user-agent"] || "";
  const parsed = parseUserAgent(userAgent);
  const ipAddress = metadata.ipAddress || (req ? getClientIp(req) : "unknown");
  const deviceFingerprint =
    metadata.deviceFingerprint ||
    `${parsed.os}-${parsed.browser}-${parsed.deviceType}`.toLowerCase();

  const suspicious = detectSuspiciousLogin(userId, deviceFingerprint, store);

  const session = {
    id: sessionId,
    userId: String(userId),
    deviceFingerprint,
    browser: metadata.browser || parsed.browser,
    os: metadata.os || parsed.os,
    deviceType: metadata.deviceType || parsed.deviceType,
    ipAddress,
    loginAt: now,
    lastActiveAt: now,
    expiresAt: createExpiresAt(),
    suspicious,
    isNewDevice: suspicious,
    location: metadata.location || null,
  };

  const userSessions = [...store.values()].filter(
    (s) => String(s.userId) === String(userId),
  );
  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    const oldest = userSessions.sort(
      (a, b) => new Date(a.lastActiveAt) - new Date(b.lastActiveAt),
    )[0];
    if (oldest) {
      store.delete(oldest.id);
      getRevokedStore().add(oldest.id);
    }
  }

  store.set(sessionId, session);
  return session;
};

export const touchSession = (sessionId) => {
  const store = getSessionStore();
  const session = store.get(sessionId);
  if (!session || isSessionExpired(session)) return null;

  session.lastActiveAt = new Date().toISOString();
  store.set(sessionId, session);
  return session;
};

export const getUserSessions = (userId, currentSessionId = "") => {
  const store = getSessionStore();
  const sessions = [...store.values()]
    .filter((s) => String(s.userId) === String(userId) && !isSessionExpired(s))
    .map((s) => ({
      ...s,
      isCurrent: currentSessionId ? s.id === currentSessionId : false,
    }))
    .sort((a, b) => new Date(b.lastActiveAt) - new Date(a.lastActiveAt));

  return sessions;
};

export const revokeSession = (sessionId, userId) => {
  const store = getSessionStore();
  const session = store.get(sessionId);

  if (!assertSessionOwner(session, userId)) {
    return { ok: false, reason: "not_found" };
  }

  store.delete(sessionId);
  getRevokedStore().add(sessionId);
  return { ok: true, session };
};

export const revokeAllSessions = (userId, exceptSessionId = "") => {
  const store = getSessionStore();
  let revokedCount = 0;

  for (const [id, session] of store.entries()) {
    if (String(session.userId) !== String(userId)) continue;
    if (exceptSessionId && id === exceptSessionId) continue;

    store.delete(id);
    getRevokedStore().add(id);
    revokedCount += 1;
  }

  return { revokedCount };
};

export const cleanupExpiredSessions = () => {
  const store = getSessionStore();
  let removed = 0;

  for (const [id, session] of store.entries()) {
    if (isSessionExpired(session)) {
      store.delete(id);
      removed += 1;
    }
  }

  return { removed };
};
