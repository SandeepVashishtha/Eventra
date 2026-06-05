const DEFAULT_RETENTION_DAYS = 7;

export const getStore = () => {
  if (!global.__eventraRecoverySessions) {
    global.__eventraRecoverySessions = new Map();
  }
  return global.__eventraRecoverySessions;
};

export const getAuthenticatedUserId = (req) => {
  const verifiedUser =
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId ||
    req.session?.user?.id ||
    null;

  if (verifiedUser) return String(verifiedUser);

  if (process.env.NODE_ENV !== "production") {
    return String(req.headers["x-user-id"] || req.headers["x-eventra-user-id"] || "");
  }

  return "";
};

export const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
};

export const parseBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
};

const createExpiresAt = (lastUpdated, retentionDays = DEFAULT_RETENTION_DAYS) => {
  const date = new Date(lastUpdated);
  date.setDate(date.getDate() + retentionDays);
  return date.toISOString();
};

const getSessionName = (payload, type) => {
  const draft = payload.draftData || {};
  const explicit = payload.name || payload.sessionName || draft.sessionName || draft.name;
  if (explicit) return String(explicit).trim().slice(0, 120);
  if (type === "event-creation") return draft.title ? `Event Draft - ${draft.title}` : "Event Draft";
  if (type === "registration-form") return "Registration Form";
  if (type === "profile-edit") return "Profile Update Draft";
  return "Recovered Draft";
};

export const normalizeSession = (payload, userId) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;

  const now = new Date().toISOString();
  const type = String(payload.type || "generic").slice(0, 80);
  const sessionId =
    String(payload.sessionId || payload.id || "").trim() ||
    `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const lastUpdated = payload.lastUpdated
    ? new Date(payload.lastUpdated).toISOString()
    : now;
  const createdAt = payload.createdAt
    ? new Date(payload.createdAt).toISOString()
    : lastUpdated;

  if (!payload.draftData || typeof payload.draftData !== "object") {
    return null;
  }

  return {
    sessionId,
    userId,
    name: getSessionName(payload, type),
    type,
    draftData: payload.draftData,
    createdAt,
    updatedAt: lastUpdated,
    lastUpdated,
    expiresAt: payload.expiresAt
      ? new Date(payload.expiresAt).toISOString()
      : createExpiresAt(lastUpdated),
    version: Number(payload.version) || 1,
  };
};

export const isExpired = (session, now = Date.now()) =>
  session?.expiresAt && new Date(session.expiresAt).getTime() <= now;

export const assertOwner = (session, userId) => session && session.userId === userId;
