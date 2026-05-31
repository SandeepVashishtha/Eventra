import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import CryptoJS from "crypto-js";
import { safeJsonParse } from "../utils/safeJsonParse";
import { logger } from "../utils/logger";
import { sanitizeSessionState } from "../utils/sessionSanitization";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";

const SessionRecoveryContext = createContext();

const SESSION_KEY = "eventra_session_state";
const SESSION_TIMEOUT = 30 * 60 * 1000;
const RECOVERY_KEY_NAME = "eventra_session_recovery_key";

const getOrCreateSessionKey = () => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  try {
    let key = sessionStorage.getItem(RECOVERY_KEY_NAME);
    if (!key) {
      key = CryptoJS.lib.WordArray.random(32).toString();
      sessionStorage.setItem(RECOVERY_KEY_NAME, key);
    }
    return key;
  } catch (e) {
    logger.error("Failed to manage session-bound recovery key:", e);
    return null;
  }
};

export const useSessionRecovery = () => {
  const context = useContext(SessionRecoveryContext);
  if (!context) {
    throw new Error("useSessionRecovery must be used within a SessionRecoveryProvider");
  }
  return context;
};

export const SessionRecoveryProvider = ({ children }) => {
  const [hasSession, setHasSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const lastActivityRef = useRef(Date.now());
  const saveTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

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
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
    };
  }, [updateActivity]);

  useEffect(() => {
    try {
      const key = getOrCreateSessionKey();
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved && key) {
        let decryptedStr = null;
        try {
          const bytes = CryptoJS.AES.decrypt(saved, key);
          decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        } catch (decryptError) {
          logger.error("Decryption of session recovery state failed (invalid key or tampered state):", decryptError);
          localStorage.removeItem(SESSION_KEY);
          return;
        }

        if (decryptedStr) {
          const parsed = safeJsonParse(decryptedStr, {});
          const now = Date.now();

          const isValidTimestamp =
            parsed &&
            parsed.timestamp &&
            typeof parsed.timestamp === "number" &&
            !isNaN(parsed.timestamp) &&
            parsed.timestamp > 0;

          if (isValidTimestamp && now - parsed.timestamp < SESSION_TIMEOUT) {
            // Verify that the restored session matches the exact same device fingerprint
            const currentFingerprint = getDeviceFingerprint();
            if (!parsed.deviceFingerprint || parsed.deviceFingerprint !== currentFingerprint) {
              logger.error("Security Alert: Session recovery attempted from a mismatched device/browser fingerprint. Rejecting session restoration.");
              localStorage.removeItem(SESSION_KEY);
              
              // Safely redirect in browser environments
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
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } else if (saved) {
        // Ciphertext exists but key is absent (e.g. new tab/session), clean up persistently stored data
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      logger.error("Failed to load session:", e);
    }
  }, []);

  const saveSession = useCallback((state) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const key = getOrCreateSessionKey();
        if (!key) {
          logger.warn("No session key available — skipping session recovery cache");
          return;
        }

        // Recursively sanitize state to redact/strip any tokens, passwords, or JWT structures
        const sanitizedState = sanitizeSessionState(state);

        const currentSession = {
          ...sanitizedState,
          timestamp: Date.now(),
          lastActivity: lastActivityRef.current,
          deviceFingerprint: getDeviceFingerprint(),
        };

        // Encrypt the state before persistently writing it to localStorage
        const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(currentSession), key).toString();

        localStorage.setItem(SESSION_KEY, ciphertext);
        setSessionData(currentSession);
        setHasSession(true);
      } catch (e) {
        logger.error("Failed to save session:", e);
      }
    }, 1000);
  }, []);

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
    return sessionData;
  }, [sessionData]);

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
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    };
  }, []);

  const value = {
    hasSession,
    sessionData,
    isOnline,
    isReconnecting,
    showRecoveryPrompt,
    saveSession,
    clearSession,
    restoreSession,
    dismissRecoveryPrompt,
    lastActivity,
  };

  return (
    <SessionRecoveryContext.Provider value={value}>{children}</SessionRecoveryContext.Provider>
  );
};