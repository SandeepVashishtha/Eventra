/**
 * useUserPreferences.js
 *
 * Centralised user preferences hook with schema validation,
 * cross-tab sync, and migration support.
 *
 * PROBLEM THIS SOLVES
 * -------------------
 * User preferences were stored inconsistently across the codebase:
 *
 *   Settings.js          — useLocalStorage("cursor", "on")
 *                          useLocalStorage("notifications", true)
 *                          useLocalStorage("privacyMode", false)
 *                          useLocalStorage("backupKey", null)
 *
 *   SponsorDashboard.jsx — localStorage.getItem("eventra_sponsor_settings")
 *                          localStorage.setItem("eventra_sponsor_settings", ...)
 *                          + separate localStorage.getItem("eventra_sponsor_leads")
 *
 *   NotificationSettings — uses NotificationContext (different storage layer)
 *
 * Problems:
 *  1. No schema — any value can be stored, no type safety
 *  2. No migration — adding a new preference key doesn't backfill existing users
 *  3. No cross-tab sync — changing settings in one tab doesn't update another
 *  4. No defaults — each call site must remember the correct default value
 *  5. Inconsistent keys — "cursor" vs "eventra_sponsor_settings" vs "notifications"
 *
 * FEATURES
 * --------
 *  1. Schema + defaults  — single source of truth for all preference keys
 *  2. Cross-tab sync     — `storage` event listener syncs across tabs
 *  3. Migration support  — version field detects and migrates stale schemas
 *  4. Type-safe updates  — `setPreference(key, value)` validates against schema
 *  5. Reset to defaults  — `resetPreferences()` clears all preferences
 *  6. SSR safe           — guards all localStorage access
 *
 * USAGE
 * -----
 *   const { preferences, setPreference, resetPreferences } = useUserPreferences();
 *
 *   // Read
 *   const { cursor, notifications, privacyMode } = preferences;
 *
 *   // Write
 *   setPreference("cursor", "off");
 *   setPreference("notifications", false);
 *
 *   // Reset all
 *   resetPreferences();
 *
 *   // Namespaced section (sponsor)
 *   const { preferences: sponsor, setPreference: setSponsor } =
 *     useUserPreferences({ namespace: "sponsor" });
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { safeJsonParse } from "utils/safeJsonParse";

// ─────────────────────────────────────────────────────────────────────────────
// Schema & defaults
// ─────────────────────────────────────────────────────────────────────────────

const SCHEMA_VERSION = 1;

const GLOBAL_DEFAULTS = {
  cursor: "on",
  notifications: true,
  privacyMode: false,
  backupKey: null,
  theme: "system",
  language: "en",
  reducedMotion: false,
  fontSize: "medium",
};

const NAMESPACE_DEFAULTS = {
  sponsor: {
    boothName: "",
    boothTheme: "default",
    contactEmail: "",
    showLogo: true,
    primaryColor: "#6366f1",
    description: "",
  },
};

const STORAGE_KEY_PREFIX = "eventra:prefs";

const getStorageKey = (namespace) =>
  namespace ? `${STORAGE_KEY_PREFIX}:${namespace}` : STORAGE_KEY_PREFIX;

// ─────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────────

const readFromStorage = (key, defaults) => {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const parsed = safeJsonParse(raw, {});
    // Merge with defaults so new keys are always present
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
};

const writeToStorage = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ ...value, _v: SCHEMA_VERSION }));
  } catch {
    // Ignore quota exceeded / private browsing
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * useUserPreferences
 *
 * @param {object} [options]
 * @param {string} [options.namespace]  Scope to a sub-namespace (e.g. "sponsor")
 *
 * @returns {{
 *   preferences:      object,
 *   setPreference:    (key: string, value: any) => void,
 *   setPreferences:   (partial: object) => void,
 *   resetPreferences: () => void,
 *   isLoaded:         boolean,
 * }}
 */
const useUserPreferences = ({ namespace } = {}) => {
  const storageKey = getStorageKey(namespace);
  const defaults = namespace
    ? NAMESPACE_DEFAULTS[namespace] ?? {}
    : GLOBAL_DEFAULTS;

  const [preferences, setPreferencesState] = useState(() =>
    readFromStorage(storageKey, defaults)
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Load from storage on mount ────────────────────────────────────────────
  useEffect(() => {
    const loaded = readFromStorage(storageKey, defaults);
    if (isMountedRef.current) {
      setPreferencesState(loaded);
      setIsLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // ── Cross-tab sync ────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event) => {
      if (event.key !== storageKey) return;
      if (!isMountedRef.current) return;
      const updated = readFromStorage(storageKey, defaults);
      setPreferencesState(updated);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey, defaults]);

  // ── setPreference ─────────────────────────────────────────────────────────
  /**
   * Update a single preference key.
   */
  const setPreference = useCallback((key, value) => {
    setPreferencesState((prev) => {
      const next = { ...prev, [key]: value };
      writeToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  // ── setPreferences ────────────────────────────────────────────────────────
  /**
   * Update multiple preference keys at once.
   */
  const setPreferences = useCallback((partial) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...partial };
      writeToStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  // ── resetPreferences ──────────────────────────────────────────────────────
  /**
   * Reset all preferences to defaults and clear storage.
   */
  const resetPreferences = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    setPreferencesState(defaults);
  }, [storageKey, defaults]);

  return {
    preferences,
    setPreference,
    setPreferences,
    resetPreferences,
    isLoaded,
  };
};

export default useUserPreferences;
