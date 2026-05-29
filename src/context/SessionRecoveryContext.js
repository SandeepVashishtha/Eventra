import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse } from "../utils/safeJsonParse";
import { logger } from "../utils/logger";
import { sanitizeSessionState } from "../utils/sessionSanitization";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";

// ---------------------------------------------------------------------------
// CryptoJS has been removed from this module.
//
// The previous implementation used CryptoJS.AES.encrypt with a plain string
// password, which internally applies OpenSSL EVP_BytesToKey (MD5, 1 iteration)
// to derive the AES key. That is a legacy, cryptographically weak scheme:
// MD5 is broken for security-sensitive use, and a single iteration provides
// almost no resistance to offline brute-force attacks.
//
// This module now uses the same PBKDF2 (SHA-256, 100 000 iterations) +
// AES-256-GCM encryption path as src/utils/secureStorage.js so both
// localStorage encryption layers in the application use an equivalent
// security level.
//
// The key material still comes from sessionStorage (cleared on tab close)
// so the threat model is unchanged — the improvement is in how the key
// is derived from that material.
// ---------------------------------------------------------------------------

const SessionRecoveryContext = createContext();

const SESSION_KEY = "eventra_session_state";
const SESSION_TIMEOUT = 30 * 60 * 1000;
const RECOVERY_KEY_NAME = "eventra_session_recovery_key";

// ---------------------------------------------------------------------------
// Web Crypto helpers — PBKDF2 + AES-256-GCM
// ---------------------------------------------------------------------------

const CRYPTO_ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_SALT_LENGTH = 32;
const SESSION_SALT_KEY = "eventra_session_recovery_salt";

/** Retrieve or generate the per-browser PBKDF2 salt for session recovery. */
const getOrCreateRecoverySalt = () => {
  try {
    const stored = localStorage.getItem(SESSION_SALT_KEY);
    if (stored) {
      return Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    }
  } catch {
    // localStorage unavailable — fall through
  }
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_LENGTH));
  try {
    localStorage.setItem(SESSION_SALT_KEY, btoa(String.fromCharCode(...salt)));
  } catch {
    // Non-fatal; salt will be regenerated next load
  }
  return salt;
};

const RECOVERY_SALT = getOrCreateRecoverySalt();

/**
 * Derive an AES-256-GCM key from the session-bound hex password stored in
 * sessionStorage. Uses PBKDF2 with SHA-256 and 100 000 iterations.
 */
const deriveKey = async (password) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: RECOVERY_SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: CRYPTO_ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );
};

/** Encrypt plaintext with PBKDF2-derived AES-256-GCM key. Returns base64 string. */
const encryptSession = async (plaintext, password) => {
  const key = await deriveKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: CRYPTO_ALGORITHM, iv },
    key,
    encoder.encode(plaintext),
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return `${ivB64}:${ctB64}`;
};

/** Decrypt a base64 ciphertext produced by encryptSession. Returns plaintext string. */
const decryptSession = async (stored, password) => {
  const colonIdx = stored.indexOf(":");
  if (colonIdx === -1) throw new Error("Invalid session ciphertext format");
  const iv = Uint8Array.from(atob(stored.slice(0, colonIdx)), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(stored.slice(colonIdx + 1)), (c) => c.charCodeAt(0));
  const key = await deriveKey(password);
  const decrypted = await crypto.subtle.decrypt({ name: CRYPTO_ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
};

/** Returns true when the Web Crypto API is available in the current context. */
const isCryptoAvailable = () =>
  typeof window !== "undefined" &&
  typeof crypto !== "undefined" &&
  typeof crypto.subtle !== "undefined" &&
  typeof crypto.getRandomValues === "function" &&
  window.isSecureContext !== false;

// ---------------------------------------------------------------------------
// Session key management — unchanged from the original implementation
// ---------------------------------------------------------------------------

const getOrCreateSessionKey = () => {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  try {
    let key = sessionStorage.getItem(RECOVERY_KEY_NAME);
    if (!key) {
      // Generate 32 random bytes and encode as hex for use as the PBKDF2 password
      const raw = crypto.getRandomValues(new Uint8Array(32));
      key = Array.from(raw)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      sessionStorage.setItem(RECOVERY_KEY_NAME, key);
    }
    return key;
  } catch (e) {
    logger.error("Failed to manage session-bound recovery key:", e);
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
    lastActivityRef.current = now;

    if (!activityTimeoutRef.current) {
      activityTimeoutRef.current = setTimeout(() => {
        setLastActivity(lastActivityRef.current);
        activityTimeoutRef.current = null;
      }, 1000);
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
    events.forEach((event) => window.addEventListener(event, updateActivity));
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
            decryptError,
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
              "Security Alert: Session recovery attempted from a mismatched device/browser fingerprint. Rejecting session restoration.",
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

          const currentSession = {
            ...sanitizedState,
            timestamp: Date.now(),
            lastActivity: lastActivityRef.current,
            deviceFingerprint: getDeviceFingerprint(),
          };

          const ciphertext = await encryptSession(JSON.stringify(currentSession), key);
          localStorage.setItem(SESSION_KEY, ciphertext);
          setSessionData(currentSession);
          setHasSession(true);
        } catch (e) {
          logger.error("Failed to save session:", e);
        }
      }, 1000);
    },
    [],
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
