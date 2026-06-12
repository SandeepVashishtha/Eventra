export const logAbuseAttempt = (type, details = {}) => {
  try {
    let existing;
    try {
      const raw = localStorage.getItem("eventra_abuse_logs");
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
    const recentLogs = existing.filter((log) => log.timestamp > oneMinuteAgo);
    if (recentLogs.length >= 10) {
      console.warn("[ABUSE LOGGER] Throttling active. Log attempt rejected.");
      return;
    }

    existing.push({
      type,
      timestamp: now,
      details,
    });

    localStorage.setItem("eventra_abuse_logs", JSON.stringify(existing.slice(-100)));
  } catch {
    // ignore storage failures
  }
};
