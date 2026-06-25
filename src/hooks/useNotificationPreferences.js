import { useState, useCallback, useEffect } from "react";
import { apiUtils, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
  readNotificationPreferences,
  writeNotificationPreferences,
} from "../utils/notificationPreferences";

export function useNotificationPreferences() {
  const { token } = useAuth();
  const [preferences, setPreferences] = useState(() => readNotificationPreferences());

  useEffect(() => {
    const handler = (event) => {
      setPreferences(
        normalizeNotificationPreferences(event.detail || readNotificationPreferences())
      );
    };
    window.addEventListener("eventra-notification-preferences", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("eventra-notification-preferences", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const updatePreferences = useCallback((next) => {
    setPreferences((current) => {
      const updated = typeof next === "function" ? next(current) : next;
      return writeNotificationPreferences(updated);
    });
  }, []);

  const savePreferences = useCallback(
    async (next) => {
      const normalized = writeNotificationPreferences(next ?? preferences);
      setPreferences(normalized);
      const endpoint = API_ENDPOINTS?.NOTIFICATIONS?.PREFERENCES;
      if (!token || !endpoint) return { savedRemotely: false, preferences: normalized };
      try {
        await apiUtils.put(endpoint, normalized);
        return { savedRemotely: true, preferences: normalized };
      } catch (error) {
        console.error("[useNotificationPreferences] Error saving:", error);
        return { savedRemotely: false, preferences: normalized, error };
      }
    },
    [preferences, token]
  );

  return {
    preferences,
    defaultPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
    updatePreferences,
    savePreferences,
  };
}
