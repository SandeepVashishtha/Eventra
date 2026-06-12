import { sanitizeForLogging } from "./logger.js";

const isDevelopment = typeof import.meta.env !== "undefined"
  ? import.meta.env.DEV
  : process.env.NODE_ENV !== "production";

export function logSecurityEvent(eventType, data) {
  if (!eventType || typeof eventType !== "string") {
    eventType = "UNKNOWN_SECURITY_EVENT";
  }

  const formattedData = {
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
    url: typeof window !== "undefined" ? window.location.href : "unknown",
    payload: sanitizeForLogging(data || {}),
  };

  // Only log to console in development to avoid leaking data in production
  if (isDevelopment) {
    console.warn(`[SECURITY EVENT] ${eventType}`, formattedData);
  }

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
