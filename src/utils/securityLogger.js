export function logSecurityEvent(eventType, data) {
  if (!eventType || typeof eventType !== "string") {
    eventType = "UNKNOWN_SECURITY_EVENT";
  }
  
  const formattedData = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    payload: data || {}
  };

  console.warn(`[SECURITY EVENT] ${eventType}`, formattedData);

  // Store in LocalStorage with logs rotation (limit to 50 logs)
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem("eventra_security_events");
      let logs = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(logs)) logs = [];
      
      logs.push({ eventType, ...formattedData });
      if (logs.length > 50) {
        logs = logs.slice(-50);
      }
      
      localStorage.setItem("eventra_security_events", JSON.stringify(logs));
    }
  } catch (err) {
    // Ignore storage failures (e.g. QuotaExceededError or private browsing)
  }
}

export function logCspViolation(report) {
  if (report && typeof report === "object") {
    logSecurityEvent("CSP_VIOLATION", report);
  }
}
