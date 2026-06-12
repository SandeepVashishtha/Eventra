const SESSION_ID_KEY = "session_id";
const SESSION_USER_KEY = "session_user_id";

const getSessionStorage = () => {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage;
  }
  return null;
};

const createSessionId = () => {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto.getRandomValues === "function") {
      const values = new Uint32Array(4);
      crypto.getRandomValues(values);
      return `session-${Date.now()}-${Array.from(values).join("-")}`;
    }
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

export const getCurrentSessionSnapshot = () => {
  try {
    return getSessionStorage()?.getItem(SESSION_ID_KEY) || null;
  } catch {
    return null;
  }
};

export const rotateSessionSnapshot = (userId = null) => {
  const storage = getSessionStorage();
  if (!storage) return null;

  const sessionId = createSessionId();
  const normalizedUserId = userId == null ? "" : String(userId);

  try {
    storage.setItem(SESSION_ID_KEY, sessionId);
    storage.setItem(SESSION_USER_KEY, normalizedUserId);
    return sessionId;
  } catch {
    return getCurrentSessionSnapshot();
  }
};

export const ensureSessionSnapshot = (userId = null) => {
  const storage = getSessionStorage();
  if (!storage) return null;

  const normalizedUserId = userId == null ? "" : String(userId);

  try {
    const existingSessionId = storage.getItem(SESSION_ID_KEY);
    const storedUserId = storage.getItem(SESSION_USER_KEY) || "";

    if (existingSessionId && storedUserId === normalizedUserId) {
      return existingSessionId;
    }

    return rotateSessionSnapshot(userId);
  } catch {
    return null;
  }
};

export const clearSessionSnapshot = () => {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(SESSION_ID_KEY);
    storage.removeItem(SESSION_USER_KEY);
  } catch {
    // Storage may be unavailable in private browsing contexts.
  }
};
