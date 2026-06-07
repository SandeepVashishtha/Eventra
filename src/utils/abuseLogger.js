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

    existing.push({
      type,
      timestamp: Date.now(),
      details,
    });

    localStorage.setItem(
      "eventra_abuse_logs",
      JSON.stringify(existing.slice(-100))
    );
  } catch {
    // ignore storage failures
  }
};