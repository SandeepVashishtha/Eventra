import { safeLocalStorage } from "./safeStorage.js";

const _hasStorage = () =>
  (typeof window !== "undefined" && window.localStorage) ||
  (typeof globalThis !== "undefined" && globalThis.localStorage);

export const logAbuseAttempt = (type, details = {}) => {
  if (!_hasStorage()) return;
  try {
    let existing;
    try {
      const raw = safeLocalStorage.getItem("eventra_abuse_logs");
      existing = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existing)) {
        existing = [];
      }
    } catch {
      existing = [];
    }

    const now = Date.now();
    // Sliding window throttling: limit to 10 abuse logs per minute
    const oneMinuteAgo = now - 60000;
    const recentLogs = existing.filter(log => log.timestamp > oneMinuteAgo);
    if (recentLogs.length >= 10) {
      console.warn("[ABUSE LOGGER] Throttling active. Log attempt rejected.");
      return;
    }

    existing.push({
      type,
      timestamp: now,
      details,
    });

    safeLocalStorage.setItem(
      "eventra_abuse_logs",
      JSON.stringify(existing.slice(-100))
    );
  } catch {
    // ignore storage failures
  }
};
