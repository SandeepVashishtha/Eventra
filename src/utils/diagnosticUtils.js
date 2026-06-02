/**
 * Utility functions for error diagnostics and state recovery.
 * Extracted from ErrorBoundary to improve modularity and maintainability.
 */

/** Generate a short, human-readable error reference ID */
export function generateErrorId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "EV-";
  for (let i = 0; i < 7; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Attempt to recover component state from sessionStorage
 * This preserves state across soft retries and reloads
 */
export function attemptStateRecovery() {
  try {
    const savedState = sessionStorage.getItem("eventra_component_state_backup");
    if (savedState) {
      window.__EVENTRA_RECOVERED_STATE__ = JSON.parse(savedState);
      sessionStorage.removeItem("eventra_component_state_backup");
      return true;
    }
  } catch (_) {
    // State recovery failed silently
  }
  return false;
}

/** Save critical app state before attempting cache reset */
export function saveAppStateSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      localStorage: (() => {
        const snap = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password")) {
            snap[k] = localStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
      sessionStorage: (() => {
        const snap = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && !k.includes("token") && !k.includes("password")) {
            snap[k] = sessionStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
    };
    sessionStorage.setItem("eventra_state_snapshot", JSON.stringify(snapshot));
  } catch (_) {}
}

/** Persist error info to localStorage for post-reload diagnosis */
export function persistErrorLog(errorId, error, errorInfo) {
  try {
    const log = {
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      message: error ? error.toString() : "Unknown error",
      stack: error?.stack || "",
      componentStack: errorInfo?.componentStack || "",
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      appState: (() => {
        try {
          return window.__EVENTRA_APP_STATE__ || {};
        } catch (_) {
          return {};
        }
      })(),
    };
    const existing = JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
    existing.unshift(log);
    // Keep only the 5 most recent errors
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 5)));
  } catch (_) {
    // Never crash inside the error boundary
  }
}

/** Build a readable diagnostic text report with enhanced information */
export function buildDiagnosticReport(errorId, error, errorInfo) {
  const lsSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password")) {
          snap[k] = localStorage.getItem(k)?.slice(0, 200);
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch (_) {
      return "Unable to read localStorage";
    }
  })();

  const sessionSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password")) {
          snap[k] = sessionStorage.getItem(k)?.slice(0, 200);
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch (_) {
      return "Unable to read sessionStorage";
    }
  })();

  return `=== EVENTRA DIAGNOSTIC REPORT ===
Error ID      : ${errorId}
Timestamp     : ${new Date().toISOString()}
URL           : ${window.location.href}
User-Agent    : ${navigator.userAgent}
Screen Size   : ${window.innerWidth}x${window.innerHeight}
Device Pixel  : ${window.devicePixelRatio}
Online Status : ${navigator.onLine}

--- Error ---
${error ? error.toString() : "Unknown error"}

--- Stack Trace ---
${error?.stack || "No stack trace"}

--- Component Stack ---
${errorInfo?.componentStack || "No component stack"}

--- LocalStorage Snapshot ---
${lsSnapshot}

--- SessionStorage Snapshot ---
${sessionSnapshot}

--- Browser Info ---
Language: ${navigator.language}
Platform: ${navigator.platform}
Cookies Enabled: ${navigator.cookieEnabled}
--- End of Report ---`;
}
