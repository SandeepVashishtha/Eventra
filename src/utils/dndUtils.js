import { NOTIFICATION_PREFERENCES_KEY } from "./notificationPreferences";

export const isDndActive = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const prefs = JSON.parse(localStorage.getItem(NOTIFICATION_PREFERENCES_KEY) || '{}');
    if (!prefs.dndEnabled) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const start = prefs.dndStart || 22;
    const end = prefs.dndEnd || 8;
    if (start > end) {
      return currentHour >= start || currentHour < end;
    }
    return currentHour >= start && currentHour < end;
  } catch {
    return false;
  }
};
