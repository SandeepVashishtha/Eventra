import { API_ENDPOINTS, apiUtils } from "../config/api";
import { sanitizeSessionState } from "../utils/sessionSanitization";
import { safeJsonParse } from "../utils/safeJsonParse";

export const CLOUD_RECOVERY_PENDING_KEY = "eventra:cloud-session-recovery:pending:v1";
export const CLOUD_RECOVERY_CACHE_KEY = "eventra:cloud-session-recovery:cache:v1";
export const DEFAULT_RECOVERY_RETENTION_DAYS = 7;
export const MAX_DRAFT_BYTES = 512 * 1024;

const RECOVERY_TYPES = new Set([
  "event-creation",
  "registration-form",
  "profile-edit",
  "multi-step-workflow",
  "session",
  "generic",
]);

const getIsoString = (value, fallback = new Date()) => {
  const date = value ? new Date(value) : fallback;
  return Number.isNaN(date.getTime()) ? fallback.toISOString() : date.toISOString();
};

const getExpiry = (lastUpdated, retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS) => {
  const base = new Date(lastUpdated);
  base.setDate(base.getDate() + retentionDays);
  return base.toISOString();
};

export const createRecoverySessionId = ({
  type = "generic",
  userId = "guest",
  now = Date.now(),
} = {}) =>
  `${type}-${userId}-${now}-${Math.random().toString(36).slice(2, 8)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    "-",
  );

const getDraftSize = (draftData) => {
  try {
    return new Blob([JSON.stringify(draftData)]).size;
  } catch {
    return JSON.stringify(draftData || {}).length;
  }
};

const inferRecoveryType = (state = {}) => {
  const rawType = state.recoveryType || state.type || state.page || "generic";
  if (rawType === "event-create" || rawType === "create-event") return "event-creation";
  if (rawType === "registration" || rawType === "event-registration") return "registration-form";
  if (rawType === "profile") return "profile-edit";
  return RECOVERY_TYPES.has(rawType) ? rawType : "generic";
};

export const normalizeRecoverySession = (
  session = {},
  {
    userId = session.userId || "",
    now = new Date(),
    retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS,
  } = {},
) => {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    return null;
  }

  const lastUpdated = getIsoString(
    session.lastUpdated || session.updatedAt || session.timestamp,
    now,
  );
  const type = inferRecoveryType(session);
  const draftData = sanitizeSessionState(session.draftData || session.data || session);

  if (getDraftSize(draftData) > MAX_DRAFT_BYTES) {
    return null;
  }

  const sessionId =
    String(session.sessionId || session.id || "").trim() ||
    createRecoverySessionId({ type, userId, now: new Date(lastUpdated).getTime() });

  return {
    sessionId,
    userId: String(userId || session.userId || "").trim(),
    type,
    draftData,
    lastUpdated,
    expiresAt: getIsoString(
      session.expiresAt,
      new Date(getExpiry(lastUpdated, retentionDays)),
    ),
    version: Number(session.version) || 1,
    source: session.source || "local",
  };
};

export const isRecoverySessionExpired = (session, now = Date.now()) => {
  if (!session?.expiresAt) return false;
  return new Date(session.expiresAt).getTime() <= Number(now);
};

export const normalizeRecoverySessions = (sessions = [], options = {}) =>
  (Array.isArray(sessions) ? sessions : [])
    .map((session) => normalizeRecoverySession(session, options))
    .filter(Boolean)
    .filter((session) => !isRecoverySessionExpired(session, options.now?.getTime?.() || Date.now()));

export const resolveRecoveryConflict = (localSession, cloudSession) => {
  if (!localSession) return cloudSession || null;
  if (!cloudSession) return localSession;

  const localTime = new Date(localSession.lastUpdated).getTime();
  const cloudTime = new Date(cloudSession.lastUpdated).getTime();

  if (localTime === cloudTime) {
    return {
      ...cloudSession,
      draftData: {
        ...localSession.draftData,
        ...cloudSession.draftData,
      },
      source: "merged",
      version: Math.max(localSession.version || 1, cloudSession.version || 1),
    };
  }

  return localTime > cloudTime
    ? { ...localSession, source: "local-newer" }
    : { ...cloudSession, source: "cloud-newer" };
};

export const mergeRecoverySessions = (localSessions = [], cloudSessions = []) => {
  const byId = new Map();
  [...cloudSessions, ...localSessions].forEach((session) => {
    const existing = byId.get(session.sessionId);
    byId.set(session.sessionId, resolveRecoveryConflict(session, existing));
  });

  return [...byId.values()].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
  );
};

export const readRecoverySessionsFromStorage = (
  storage = globalThis.localStorage,
  key = CLOUD_RECOVERY_CACHE_KEY,
) => {
  if (!storage?.getItem) return [];
  try {
    const parsed = safeJsonParse(storage.getItem(key), []);
    return normalizeRecoverySessions(parsed);
  } catch {
    storage.removeItem?.(key);
    return [];
  }
};

export const writeRecoverySessionsToStorage = (
  sessions = [],
  storage = globalThis.localStorage,
  key = CLOUD_RECOVERY_CACHE_KEY,
) => {
  const normalized = normalizeRecoverySessions(sessions);
  storage?.setItem?.(key, JSON.stringify(normalized));
  return normalized;
};

export const readPendingRecoveryQueue = (
  storage = globalThis.localStorage,
  key = CLOUD_RECOVERY_PENDING_KEY,
) => {
  if (!storage?.getItem) return [];
  try {
    const parsed = safeJsonParse(storage.getItem(key), []);
    return normalizeRecoverySessions(parsed);
  } catch {
    storage.removeItem?.(key);
    return [];
  }
};

export const queuePendingRecoverySession = (
  session,
  storage = globalThis.localStorage,
  key = CLOUD_RECOVERY_PENDING_KEY,
) => {
  const normalized = normalizeRecoverySession(session);
  if (!normalized) return readPendingRecoveryQueue(storage, key);

  const queue = mergeRecoverySessions([normalized], readPendingRecoveryQueue(storage, key));
  storage?.setItem?.(key, JSON.stringify(queue));
  return queue;
};

export const clearPendingRecoveryQueue = (
  storage = globalThis.localStorage,
  key = CLOUD_RECOVERY_PENDING_KEY,
) => {
  storage?.removeItem?.(key);
};

export const createRecoveryPayload = ({
  state,
  userId,
  sessionId,
  type,
  retentionDays = DEFAULT_RECOVERY_RETENTION_DAYS,
  now = new Date(),
} = {}) =>
  normalizeRecoverySession(
    {
      sessionId,
      userId,
      type: type || inferRecoveryType(state),
      draftData: state,
      lastUpdated: now.toISOString(),
    },
    { userId, now, retentionDays },
  );

export const saveRecoverySession = async (payload) => {
  const session = normalizeRecoverySession(payload);
  if (!session) {
    throw new Error("Invalid recovery session payload.");
  }
  const response = await apiUtils.post(API_ENDPOINTS.SESSION_RECOVERY.BASE, session);
  return normalizeRecoverySession(response.data || session);
};

export const updateRecoverySession = async (sessionId, payload) => {
  const session = normalizeRecoverySession({ ...payload, sessionId });
  if (!session) {
    throw new Error("Invalid recovery session payload.");
  }
  const response = await apiUtils.put(API_ENDPOINTS.SESSION_RECOVERY.SESSION(sessionId), session);
  return normalizeRecoverySession(response.data || session);
};

export const fetchRecoverySessions = async () => {
  const response = await apiUtils.get(API_ENDPOINTS.SESSION_RECOVERY.BASE);
  const data = response.data?.sessions || response.data || [];
  return normalizeRecoverySessions(data);
};

export const restoreRecoverySession = async (sessionId) => {
  const response = await apiUtils.post(API_ENDPOINTS.SESSION_RECOVERY.RESTORE(sessionId), {});
  return normalizeRecoverySession(response.data?.session || response.data);
};

export const deleteRecoverySession = async (sessionId) => {
  await apiUtils.delete(API_ENDPOINTS.SESSION_RECOVERY.SESSION(sessionId));
  return true;
};

export const cleanupExpiredRecoverySessions = async () => {
  const response = await apiUtils.delete(API_ENDPOINTS.SESSION_RECOVERY.CLEANUP_EXPIRED);
  return response.data || { deleted: 0 };
};

export const syncPendingRecoverySessions = async (
  storage = globalThis.localStorage,
) => {
  const queue = readPendingRecoveryQueue(storage);
  const synced = [];
  const failed = [];

  for (const session of queue) {
    try {
      const saved = await saveRecoverySession(session);
      synced.push(saved);
    } catch {
      failed.push(session);
    }
  }

  if (failed.length) {
    storage?.setItem?.(CLOUD_RECOVERY_PENDING_KEY, JSON.stringify(failed));
  } else {
    clearPendingRecoveryQueue(storage);
  }

  return { synced, failed };
};
