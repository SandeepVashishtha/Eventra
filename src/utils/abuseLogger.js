export const logAbuseAttempt = (type, details = {}) => {
  try {
    const existing = JSON.parse(
      localStorage.getItem("eventra_abuse_logs") || "[]"
    );

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