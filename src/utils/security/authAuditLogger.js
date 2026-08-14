// Client-side authentication audit logging helper
const AUDIT_LOG_KEY = "eventra_auth_audit_logs";

export function logAuthEvent(level, message, metadata = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || "[]");
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      level, // INFO, WARNING, ALARM
      message,
      metadata
    };
    logs.push(newLog);
    // Limit to last 100 logs
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs.slice(-100)));
  } catch (err) {
    console.error("Failed to write to authentication audit logs", err);
  }
}

export function getAuthLogs() {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearAuthLogs() {
  try {
    localStorage.removeItem(AUDIT_LOG_KEY);
  } catch {}
}
