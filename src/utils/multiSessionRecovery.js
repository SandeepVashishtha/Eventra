import {
  DEFAULT_RECOVERY_RETENTION_DAYS,
  normalizeRecoverySession,
} from "../services/sessionRecoveryService.js";

export const MULTI_SESSION_RECOVERY_KEY = "eventra:multi-session-recovery:v1";

const getTimestamp = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const buildExpiry = (updatedAt, retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS) => {
  const date = new Date(updatedAt);
  date.setDate(date.getDate() + retentionDays);
  return date.toISOString();
};

const createId = (type = "generic", now = Date.now()) =>
  `${type}-${now}-${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, "-");

const normalizeId = (session = {}) =>
  String(session.id || session.sessionId || "").trim();

export const normalizeMultiSession = (
  session = {},
  {
    now = new Date(),
    source = session.source || "local",
    retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS,
  } = {},
) => {
  const normalized = normalizeRecoverySession(session, { now, retentionDays });
  if (!normalized) return null;

  const updatedAt = getTimestamp(session.updatedAt || normalized.updatedAt || normalized.lastUpdated);
  const createdAt = getTimestamp(session.createdAt || normalized.createdAt || updatedAt);
  const id = normalizeId(session) || normalized.sessionId || createId(normalized.type, new Date(updatedAt).getTime());

  return {
    id,
    sessionId: id,
    name: normalized.name || session.name || "Recovered Draft",
    type: normalized.type,
    createdAt,
    updatedAt,
    lastUpdated: updatedAt,
    expiresAt: session.expiresAt || normalized.expiresAt || buildExpiry(updatedAt, retentionDays),
    draftData: normalized.draftData,
    source,
    userId: normalized.userId,
    version: normalized.version || 1,
  };
};

export const isMultiSessionExpired = (session, now = Date.now()) =>
  Boolean(session?.expiresAt && new Date(session.expiresAt).getTime() <= Number(now));

export const sortRecoverySessions = (sessions = []) =>
  [...sessions].sort(
    (a, b) => new Date(b.updatedAt || b.lastUpdated).getTime() - new Date(a.updatedAt || a.lastUpdated).getTime(),
  );

export const normalizeMultiSessions = (sessions = [], options = {}) => {
  const byId = new Map();

  (Array.isArray(sessions) ? sessions : []).forEach((session) => {
    const normalized = normalizeMultiSession(session, options);
    if (!normalized || isMultiSessionExpired(normalized, options.now?.getTime?.() || Date.now())) {
      return;
    }

    const existing = byId.get(normalized.id);
    if (!existing) {
      byId.set(normalized.id, normalized);
      return;
    }

    byId.set(normalized.id, resolveMultiSessionConflict(existing, normalized));
  });

  return sortRecoverySessions([...byId.values()]);
};

export const resolveMultiSessionConflict = (left, right) => {
  if (!left) return right || null;
  if (!right) return left || null;

  const leftTime = new Date(left.updatedAt || left.lastUpdated).getTime();
  const rightTime = new Date(right.updatedAt || right.lastUpdated).getTime();

  if (leftTime === rightTime) {
    return {
      ...left,
      ...right,
      draftData: {
        ...left.draftData,
        ...right.draftData,
      },
      source: left.source === right.source ? left.source : "merged",
      version: Math.max(left.version || 1, right.version || 1),
    };
  }

  return leftTime > rightTime ? left : right;
};

export const createRecoverySession = ({
  name,
  type = "generic",
  draftData = {},
  source = "local",
  userId = "",
  sessionId,
  now = new Date(),
  retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS,
} = {}) => {
  const updatedAt = getTimestamp(now);
  const id = sessionId || createId(type, new Date(updatedAt).getTime());

  return normalizeMultiSession(
    {
      id,
      sessionId: id,
      name,
      type,
      draftData,
      source,
      userId,
      createdAt: updatedAt,
      updatedAt,
      lastUpdated: updatedAt,
      expiresAt: buildExpiry(updatedAt, retentionDays),
    },
    { now: new Date(updatedAt), source, retentionDays },
  );
};

export const upsertRecoverySession = (sessions = [], session = {}, options = {}) => {
  const normalized = normalizeMultiSession(session, options);
  if (!normalized) return normalizeMultiSessions(sessions, options);

  const withoutExisting = normalizeMultiSessions(sessions, options).filter(
    (item) => item.id !== normalized.id,
  );
  return normalizeMultiSessions([...withoutExisting, normalized], options);
};

export const updateRecoverySessionEntry = (
  sessions = [],
  sessionId,
  patch = {},
  { now = new Date(), retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS } = {},
) => {
  const updatedAt = getTimestamp(now);
  return normalizeMultiSessions(
    sessions.map((session) =>
      session.id === sessionId || session.sessionId === sessionId
        ? {
            ...session,
            ...patch,
            draftData: patch.draftData || session.draftData,
            updatedAt,
            lastUpdated: updatedAt,
            expiresAt: patch.expiresAt || buildExpiry(updatedAt, retentionDays),
            version: (session.version || 1) + 1,
          }
        : session,
    ),
    { now: new Date(updatedAt), retentionDays },
  );
};

export const renameRecoverySessionEntry = (sessions = [], sessionId, name) => {
  const cleanName = String(name || "").replace(/\s+/g, " ").trim();
  if (!cleanName) return normalizeMultiSessions(sessions);
  return updateRecoverySessionEntry(sessions, sessionId, { name: cleanName });
};

export const deleteRecoverySessionEntry = (sessions = [], sessionId) =>
  normalizeMultiSessions(sessions).filter(
    (session) => session.id !== sessionId && session.sessionId !== sessionId,
  );

export const cleanupExpiredRecoverySessions = (sessions = [], now = Date.now()) =>
  normalizeMultiSessions(sessions).filter((session) => !isMultiSessionExpired(session, now));

export const filterRecoverySessions = (sessions = [], query = "") => {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return normalizeMultiSessions(sessions);

  return normalizeMultiSessions(sessions).filter((session) =>
    [session.name, session.type, session.source]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
  );
};

export const groupRecoverySessionsByType = (sessions = []) =>
  normalizeMultiSessions(sessions).reduce((groups, session) => {
    const type = session.type || "generic";
    groups[type] = groups[type] || [];
    groups[type].push(session);
    return groups;
  }, {});

export const readMultiSessions = (
  storage = globalThis.localStorage,
  key = MULTI_SESSION_RECOVERY_KEY,
) => {
  if (!storage?.getItem) return [];
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    return normalizeMultiSessions(JSON.parse(raw));
  } catch {
    storage.removeItem?.(key);
    return [];
  }
};

export const writeMultiSessions = (
  sessions = [],
  storage = globalThis.localStorage,
  key = MULTI_SESSION_RECOVERY_KEY,
) => {
  const normalized = normalizeMultiSessions(sessions);
  storage?.setItem?.(key, JSON.stringify(normalized));
  return normalized;
};
