export const isDndActive = () => {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const prefs = JSON.parse(window.localStorage.getItem('eventra_notification_prefs') || '{}');
    if (!prefs.dndEnabled) return false;
    const now = new Date();
    const currentHour = now.getHours();
    const start = prefs.dndStart || 22;
    const end = prefs.dndEnd || 8;
    if (start > end) {
      return currentHour >= start || currentHour < end;
    }
    return currentHour >= start && currentHour < end;
  } catch (e) {
    return false;
  }
};
