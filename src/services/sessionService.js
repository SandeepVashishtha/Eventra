import { apiUtils, API_ENDPOINTS } from "../config/api";
import { getDeviceMetadata } from "../utils/deviceFingerprint";

const CURRENT_SESSION_KEY = "eventra_current_session_id";

const buildLocalSession = () => {
  const metadata = getDeviceMetadata();
  const sessionId = getStoredSessionId() || `local-${metadata.deviceFingerprint}`;
  setStoredSessionId(sessionId);

  return {
    id: sessionId,
    userId: "local",
    ...metadata,
    ipAddress: "Local",
    loginAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    suspicious: false,
    isNewDevice: false,
    isCurrent: true,
    isLocalFallback: true,
  };
};

export const getStoredSessionId = () => {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY) || "";
  } catch {
    return "";
  }
};

export const setStoredSessionId = (sessionId) => {
  try {
    if (sessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

const buildSessionHeaders = () => {
  const sessionId = getStoredSessionId();
  return sessionId ? { "X-Session-Id": sessionId } : {};
};

export const sessionService = {
  list: async () => {
    try {
      return await apiUtils.get(API_ENDPOINTS.SESSIONS.ALL, {
        headers: buildSessionHeaders(),
      });
    } catch (err) {
      if (err?.status === 404 || err?.isNetworkError) {
        return {
          status: 200,
          ok: true,
          data: { sessions: [buildLocalSession()], currentSessionId: getStoredSessionId() },
        };
      }
      throw err;
    }
  },

  register: async (sessionId = null) => {
    const metadata = getDeviceMetadata();
    const payload = {
      ...metadata,
      sessionId: sessionId || getStoredSessionId() || undefined,
    };

    try {
      const res = await apiUtils.post(API_ENDPOINTS.SESSIONS.ALL, payload, {
        headers: buildSessionHeaders(),
      });

      const newSessionId = res.data?.session?.id;
      if (newSessionId) {
        setStoredSessionId(newSessionId);
      }

      return res;
    } catch (err) {
      if (err?.status === 404 || err?.isNetworkError) {
        const local = buildLocalSession();
        return {
          status: 201,
          ok: true,
          data: { session: local, notifyNewDevice: false },
        };
      }
      throw err;
    }
  },

  heartbeat: async () => {
    const sessionId = getStoredSessionId();
    if (!sessionId) return null;

    try {
      return await apiUtils.post(
        API_ENDPOINTS.SESSIONS.ALL,
        { action: "heartbeat", sessionId },
        { headers: buildSessionHeaders() },
      );
    } catch {
      return null;
    }
  },

  revoke: async (sessionId) => {
    try {
      return await apiUtils.delete(API_ENDPOINTS.SESSIONS.BY_ID(sessionId), {
        headers: buildSessionHeaders(),
      });
    } catch (err) {
      if (err?.status === 404 || err?.isNetworkError) {
        const wasCurrent = sessionId === getStoredSessionId();
        if (wasCurrent) {
          setStoredSessionId("");
        }
        return {
          status: 200,
          ok: true,
          data: { revoked: true, sessionId, revokedCurrentSession: wasCurrent },
        };
      }
      throw err;
    }
  },

  revokeAll: async () => {
    try {
      return await apiUtils.delete(API_ENDPOINTS.SESSIONS.LOGOUT_ALL, {
        headers: buildSessionHeaders(),
      });
    } catch (err) {
      if (err?.status === 404 || err?.isNetworkError) {
        return {
          status: 200,
          ok: true,
          data: { revoked: true, revokedCount: 0, keptCurrentSession: true },
        };
      }
      throw err;
    }
  },

  clearLocalSession: () => {
    setStoredSessionId("");
  },
};
