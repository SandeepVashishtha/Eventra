export function logSecurityEvent(eventType, data) {
  console.warn(`[SECURITY EVENT] ${eventType}`, data);
}

export function logCspViolation(report) {
  logSecurityEvent("CSP_VIOLATION", report);
}