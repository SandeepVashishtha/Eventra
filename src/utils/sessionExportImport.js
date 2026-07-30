import {
  createRecoverySession,
  normalizeMultiSession,
  normalizeMultiSessions,
} from "./multiSessionRecovery.js";

export const SESSION_BACKUP_VERSION = "1.0";
export const MAX_SESSION_BACKUP_BYTES = 1024 * 1024;

const pad = (value) => String(value).padStart(2, "0");

export const getSessionBackupDateStamp = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const getSessionBackupFilename = (date = new Date()) =>
  `session-backup-${getSessionBackupDateStamp(date)}.json`;

export const createSessionBackup = (sessions = [], now = new Date()) => {
  const normalizedSessions = normalizeMultiSessions(sessions);

  return {
    version: SESSION_BACKUP_VERSION,
    exportedAt: now.toISOString(),
    count: normalizedSessions.length,
    sessions: normalizedSessions.map((session) => ({
      id: session.id,
      sessionId: session.sessionId,
      name: session.name,
      type: session.type,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      expiresAt: session.expiresAt,
      source: session.source,
      version: session.version,
      draftData: session.draftData,
    })),
  };
};

export const stringifySessionBackup = (sessions = [], now = new Date()) =>
  JSON.stringify(createSessionBackup(sessions, now), null, 2);

export const downloadSessionBackup = ({
  sessions = [],
  filename = getSessionBackupFilename(),
  now = new Date(),
} = {}) => {
  const content = stringifySessionBackup(sessions, now);

  if (typeof document === "undefined" || typeof Blob === "undefined") {
    throw new Error("Session backup downloads are only available in a browser.");
  }

  const urlApi = typeof window !== "undefined" && window.URL ? window.URL : URL;
  const blob = new Blob([content], { type: "application/json;charset=utf-8;" });
  const url = urlApi.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    urlApi.revokeObjectURL(url);
  }

  return { filename, count: normalizeMultiSessions(sessions).length };
};

const getStringByteSize = (value) => {
  if (typeof Blob !== "undefined") {
    return new Blob([value]).size;
  }
  return String(value || "").length;
};

export const parseSessionBackupJson = (rawJson) => {
  if (typeof rawJson !== "string" || !rawJson.trim()) {
    return { ok: false, error: "Backup file is empty." };
  }

  if (getStringByteSize(rawJson) > MAX_SESSION_BACKUP_BYTES) {
    return { ok: false, error: "Backup file is too large." };
  }

  try {
    return validateSessionBackup(JSON.parse(rawJson));
  } catch {
    return { ok: false, error: "Backup file is not valid JSON." };
  }
};

export const validateSessionBackup = (backup) => {
  if (!backup || typeof backup !== "object" || Array.isArray(backup)) {
    return { ok: false, error: "Backup must be a JSON object." };
  }

  if (backup.version !== SESSION_BACKUP_VERSION) {
    return { ok: false, error: "Unsupported session backup version." };
  }

  if (!backup.exportedAt || Number.isNaN(new Date(backup.exportedAt).getTime())) {
    return { ok: false, error: "Backup export timestamp is missing or invalid." };
  }

  if (!Array.isArray(backup.sessions)) {
    return { ok: false, error: "Backup does not contain a sessions array." };
  }

  const sessions = normalizeMultiSessions(backup.sessions);
  if (backup.sessions.length > 0 && sessions.length === 0) {
    return { ok: false, error: "Backup sessions are malformed or expired." };
  }

  return {
    ok: true,
    backup: {
      version: backup.version,
      exportedAt: backup.exportedAt,
      count: sessions.length,
      sessions,
    },
    sessions,
  };
};

const cloneSessionWithNewId = (session, suffix = "imported") => {
  const now = new Date();
  return createRecoverySession({
    sessionId: `${session.sessionId}-${suffix}-${Date.now()}`,
    name: `${session.name} (Imported)`,
    type: session.type,
    draftData: session.draftData,
    source: session.source || "imported",
    userId: session.userId,
    now,
  });
};

export const resolveImportedSessions = ({
  existingSessions = [],
  importedSessions = [],
  strategy = "skip",
} = {}) => {
  const existing = normalizeMultiSessions(existingSessions);
  const imported = normalizeMultiSessions(importedSessions).map((session) => ({
    ...session,
    source: session.source || "imported",
  }));
  const byId = new Map(existing.map((session) => [session.sessionId, session]));
  const restored = [];
  const skipped = [];
  const replaced = [];
  const renamed = [];

  imported.forEach((session) => {
    const duplicate = byId.get(session.sessionId);

    if (!duplicate) {
      byId.set(session.sessionId, session);
      restored.push(session);
      return;
    }

    if (strategy === "replace") {
      byId.set(session.sessionId, session);
      replaced.push(session);
      restored.push(session);
      return;
    }

    if (strategy === "keep-both" || strategy === "rename") {
      const renamedSession = normalizeMultiSession(cloneSessionWithNewId(session));
      byId.set(renamedSession.sessionId, renamedSession);
      renamed.push(renamedSession);
      restored.push(renamedSession);
      return;
    }

    skipped.push(session);
  });

  return {
    sessions: normalizeMultiSessions([...byId.values()]),
    restored,
    skipped,
    replaced,
    renamed,
  };
};
