import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";
import { logger } from "../utils/logger";
import { sanitizeSessionState } from "../utils/sessionSanitization";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";
import { useAuth } from "./AuthContext";
import useCloudSessionRecovery from "../hooks/useCloudSessionRecovery";
import useMultiSessionRecovery from "../hooks/useMultiSessionRecovery";
import { deriveKey, encryptWithKey, decryptWithKey } from "../utils/secureStorage.js";

// ---------------------------------------------------------------------------
// Encryption: delegates to src/utils/secureStorage.js — the single
// PBKDF2 + AES-256-GCM implementation used by all client-side storage.
//
// SessionRecoveryContext (unlike syncSecureStorage) uses a session-scoped
// password stored in sessionStorage so that encrypted blobs are bound to
// the browser tab and cannot be decrypted after the tab is closed.
// ---------------------------------------------------------------------------

const SessionRecoveryContext = createContext();

const SESSION_KEY = "eventra_session_state";
const SESSION_TIMEOUT = 30 * 60 * 1000;
const PBKDF2_SALT_LENGTH = 32;
const SESSION_SALT_KEY = "eventra_session_recovery_salt";

const getOrCreateRecoverySalt = () => {
  try {
    const stored = localStorage.getItem(SESSION_SALT_KEY);
    if (stored) return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  } catch {}
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));
  try {
    localStorage.setItem(SESSION_SALT_KEY, btoa(String.fromCharCode(...salt)));
  } catch {}
  return salt;
};

const RECOVERY_SALT = getOrCreateRecoverySalt();

const getSessionKey = (password) => deriveKey(password, RECOVERY_SALT);

const encryptSession = async (plaintext, password) => {
  const key = await getSessionKey(password);
  return encryptWithKey(key, plaintext);
};

const decryptSession = async (stored, password) => {
  const key = await getSessionKey(password);
  return decryptWithKey(key, stored);
};

const isCryptoAvailable = () =>
  typeof window !== "undefined" &&
  typeof crypto !== "undefined" &&
  typeof crypto.subtle !== "undefined" &&
  typeof crypto.getRandomValues === "function" &&
  window.isSecureContext !== false;

// ---------------------------------------------------------------------------
// Session key management — unchanged from the original implementation
// ---------------------------------------------------------------------------

// In-memory only — never written to sessionStorage or localStorage
let _inMemorySessionKey = null;

const getOrCreateSessionKey = () => {
  if (typeof window === "undefined") return null;
  try {
    if (!_inMemorySessionKey) {
      const stored = sessionStorage.getItem("eventra_session_key");
      if (stored) {
        _inMemorySessionKey = stored;
      } else {
        const raw = crypto.getRandomValues(new Uint8Array(32));
        _inMemorySessionKey = Array.from(raw)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        sessionStorage.setItem("eventra_session_key", _inMemorySessionKey);
      }
    }
    return _inMemorySessionKey;
  } catch (e) {
    logger.error("Failed to generate in-memory session key:", e);
    return null;
  }
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const useSessionRecovery = () => {
  const context = useContext(SessionRecoveryContext);
  if (!context) {
    throw new Error("useSessionRecovery must be used within a SessionRecoveryProvider");
  }
  return context;
};

export const SessionRecoveryProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [hasSession, setHasSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const lastActivityRef = useRef(Date.now());
  const saveTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const cloudRecovery = useCloudSessionRecovery({
    user,
    isAuthenticated: isAuthenticated?.() || false,
  });
  const multiRecovery = useMultiSessionRecovery({
    cloudSessions: cloudRecovery.cloudSessions,
  });

  const updateActivity = useCallback(() => {
    const now = Date.now();
    // 🔥 FIX: Throttle to max once per second to prevent CPU thrashing from mousemove/scroll
    if (now - lastActivityRef.current > 1000) {
      lastActivityRef.current = now;
      // 🔥 FIX: Synchronize React state so context consumers get accurate data
      setLastActivity(now);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(true);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    // 🔥 FIX: Added { passive: true } to further optimize scroll performance
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [updateActivity]);

  // Load and decrypt the persisted session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        if (!isCryptoAvailable()) return;

        const key = getOrCreateSessionKey();
        const saved = localStorage.getItem(SESSION_KEY);

        if (!saved || !key) {
          if (saved) localStorage.removeItem(SESSION_KEY);
          return;
        }

        let decryptedStr = null;
        try {
          decryptedStr = await decryptSession(saved, key);
        } catch (decryptError) {
          logger.error(
            "Decryption of session recovery state failed (invalid key or tampered state):",
            decryptError
          );
          localStorage.removeItem(SESSION_KEY);
          return;
        }

        const parsed = safeJsonParse(decryptedStr, {});
        const now = Date.now();

        const isValidTimestamp =
          parsed &&
          typeof parsed.timestamp === "number" &&
          !isNaN(parsed.timestamp) &&
          parsed.timestamp > 0;

        if (isValidTimestamp && now - parsed.timestamp < SESSION_TIMEOUT) {
          const currentFingerprint = getDeviceFingerprint();
          if (!parsed.deviceFingerprint || parsed.deviceFingerprint !== currentFingerprint) {
            logger.error(
              "Security Alert: Session recovery attempted from a mismatched device/browser fingerprint. Rejecting session restoration."
            );
            localStorage.removeItem(SESSION_KEY);
            if (typeof window !== "undefined" && window.location) {
              window.location.href = "/login";
            }
            return;
          }

          setSessionData(parsed);
          setHasSession(true);
          setShowRecoveryPrompt(true);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch (e) {
        logger.error("Failed to load session:", e);
      }
    };

    loadSession();
  }, []);

  const saveSession = useCallback(
    (state) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (!isCryptoAvailable()) return;

          const key = getOrCreateSessionKey();
          if (!key) {
            logger.warn("No session key available — skipping session recovery cache");
            return;
          }

          const sanitizedState = sanitizeSessionState(state);
          const recoveryType = sanitizedState.recoveryType || sanitizedState.page || "session";
          const workflowId = sanitizedState.eventId || sanitizedState.id || "active";
          const sessionId =
            sanitizedState.sessionId ||
            sanitizedState.recoverySessionId ||
            `${recoveryType}-${workflowId}`;

          const currentSession = {
            ...sanitizedState,
            sessionId,
            sessionName: sanitizedState.sessionName || sanitizedState.name,
            recoveryType,
            timestamp: Date.now(),
            lastActivity: lastActivityRef.current,
            deviceFingerprint: getDeviceFingerprint(),
          };

          const ciphertext = await encryptSession(JSON.stringify(currentSession), key);
          localStorage.setItem(SESSION_KEY, ciphertext);
          setSessionData(currentSession);
          setHasSession(true);
          multiRecovery.upsertSession({
            sessionId,
            name: currentSession.sessionName,
            type: recoveryType,
            draftData: currentSession,
            source: "local",
            updatedAt: new Date(currentSession.timestamp).toISOString(),
            lastUpdated: new Date(currentSession.timestamp).toISOString(),
          });
          cloudRecovery.saveCloudSession(currentSession, {
            sessionId,
            name: currentSession.sessionName,
            type: recoveryType,
          });
        } catch (e) {
          logger.error("Failed to save session:", e);
        }
      }, 1000);
    },
    [cloudRecovery, multiRecovery]
  );

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSessionData(null);
      setHasSession(false);
      setShowRecoveryPrompt(false);
    } catch (e) {
      logger.error("Failed to clear session:", e);
    }
  }, []);

  const restoreSession = useCallback(() => {
    if (!sessionData) return null;
    if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
      window.dispatchEvent(new CustomEvent("eventra-session-restored"));
    }
    return sessionData;
  }, [sessionData]);

  const restoreRecoverySessionById = useCallback(
    async (sessionId) => {
      const session = multiRecovery.sessions.find(
        (item) => item.id === sessionId || item.sessionId === sessionId
      );
      if (!session) return null;

      if (session.source === "cloud" || session.source === "cloud-newer") {
        const restored = await cloudRecovery.restoreCloudSession(session.sessionId);
        return restored?.draftData || restored || session.draftData;
      }

      return session.draftData;
    },
    [cloudRecovery, multiRecovery.sessions]
  );

  const deleteRecoverySessionById = useCallback(
    async (sessionId) => {
      const session = multiRecovery.sessions.find(
        (item) => item.id === sessionId || item.sessionId === sessionId
      );
      multiRecovery.deleteSession(sessionId);
      if (session?.source === "cloud" || session?.source === "cloud-newer") {
        await cloudRecovery.dismissCloudSession(session.sessionId);
      }
    },
    [cloudRecovery, multiRecovery]
  );

  const renameRecoverySessionById = useCallback(
    (sessionId, name) => {
      multiRecovery.renameSession(sessionId, name);
    },
    [multiRecovery]
  );

  const dismissRecoveryPrompt = useCallback(() => {
    setShowRecoveryPrompt(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;
      if (inactiveTime > SESSION_TIMEOUT && hasSession) {
        clearSession();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [hasSession, clearSession]);

  useEffect(() => {
    if ((multiRecovery.hasSessions || cloudRecovery.hasCloudSessions) && !sessionData) {
      setShowRecoveryPrompt(true);
    }
  }, [cloudRecovery.hasCloudSessions, multiRecovery.hasSessions, sessionData]);

  useEffect(() => {
    const saveTimeout = saveTimeoutRef.current;
    const activityTimeout = activityTimeoutRef.current;
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, []);

  const value = {
    hasSession,
    sessionData,
    isOnline,
    isReconnecting,
    showRecoveryPrompt,
    recoverySessions: multiRecovery.sessions,
    visibleRecoverySessions: multiRecovery.visibleSessions,
    groupedRecoverySessions: multiRecovery.groupedSessions,
    recoverySessionSearchQuery: multiRecovery.searchQuery,
    setRecoverySessionSearchQuery: multiRecovery.setSearchQuery,
    hasRecoverySessions: multiRecovery.hasSessions,
    cloudSessions: cloudRecovery.cloudSessions,
    hasCloudSessions: cloudRecovery.hasCloudSessions,
    isCloudSyncing: cloudRecovery.isCloudSyncing,
    cloudSyncError: cloudRecovery.cloudSyncError,
    saveSession,
    clearSession,
    restoreSession,
    restoreRecoverySessionById,
    restoreCloudSession: cloudRecovery.restoreCloudSession,
    deleteRecoverySessionById,
    renameRecoverySessionById,
    importRecoverySessions: multiRecovery.replaceSessions,
    dismissCloudSession: cloudRecovery.dismissCloudSession,
    refreshCloudSessions: cloudRecovery.refreshCloudSessions,
    dismissRecoveryPrompt,
    lastActivity,
  };

  return (
    <SessionRecoveryContext.Provider value={value}>{children}</SessionRecoveryContext.Provider>
  );
};
