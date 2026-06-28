export function generateErrorId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "EV-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export const SENSITIVE_URL_PARAMS = new Set([
  "token", "code", "state", "key", "secret", "reset",
  "id_token", "access_token", "refresh_token", "otp",
  "password", "auth", "api_key",
]);

export function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    for (const param of parsed.searchParams.keys()) {
      if (SENSITIVE_URL_PARAMS.has(param.toLowerCase())) {
        parsed.searchParams.set(param, "***");
      }
    }
    return parsed.href;
  } catch {
    return url;
  }
}

export function attemptStateRecovery() {
  try {
    const savedState = sessionStorage.getItem("eventra_component_state_backup");
    if (savedState) {
      const parsed = JSON.parse(savedState, (key, value) => {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;
        return value;
      });
      window.__EVENTRA_RECOVERED_STATE__ = parsed;
      sessionStorage.removeItem("eventra_component_state_backup");
      return true;
    }
  } catch {}
  return false;
}

export function saveAppStateSnapshot() {
  try {
    const snapshot = {
      timestamp: new Date().toISOString(),
      url: sanitizeUrl(window.location.href),
      localStorage: (() => {
        const snap = {};
        const ALLOWED = ["my_events_", "bookmarks_", "eventra_theme", "eventra_language", "eventra_preferences"];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && ALLOWED.some((safe) => k.startsWith(safe))) {
            try { snap[k] = localStorage.getItem(k)?.slice(0, 100); } catch {}
          }
        }
        return snap;
      })(),
      sessionStorage: (() => {
        const snap = {};
        const ALLOWED = ["my_events_", "bookmarks_", "eventra_theme", "eventra_language", "eventra_preferences"];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && ALLOWED.some((safe) => k.startsWith(safe))) {
            snap[k] = sessionStorage.getItem(k)?.slice(0, 100);
          }
        }
        return snap;
      })(),
    };
    sessionStorage.setItem("eventra_state_snapshot", JSON.stringify(snapshot));
  } catch {}
}

export function buildDiagnosticReport(errorId, error, errorInfo) {
  const lsSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password") && !k.includes("eventra:key-material") && !k.includes("eventra:key-salt")) {
          try { snap[k] = process.env.NODE_ENV === "production" ? "[redacted]" : (localStorage.getItem(k)?.slice(0, 200)); } catch {}
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch {
      return "Unable to read localStorage";
    }
  })();

  const sessionSnapshot = (() => {
    try {
      const snap = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && !k.includes("token") && !k.includes("password") && !k.includes("eventra:key-material") && !k.includes("eventra:key-salt")) {
          try { snap[k] = process.env.NODE_ENV === "production" ? "[redacted]" : (sessionStorage.getItem(k)?.slice(0, 200)); } catch {}
        }
      }
      return JSON.stringify(snap, null, 2);
    } catch {
      return "Unable to read sessionStorage";
    }
  })();

  return \`=== EVENTRA DIAGNOSTIC REPORT ===
Error ID      : \${errorId}
Timestamp     : \${new Date().toISOString()}
URL           : \${sanitizeUrl(window.location.href)}
User-Agent    : \${navigator.userAgent}
Screen Size   : \${window.innerWidth}x\${window.innerHeight}
Device Pixel  : \${window.devicePixelRatio}
Online Status : \${navigator.onLine}

--- Error ---
\${error ? error.toString() : "Unknown error"}

--- Stack Trace ---
\${error?.stack || "No stack trace"}

--- Component Stack ---
\${errorInfo?.componentStack || "No component stack"}

--- LocalStorage Snapshot ---
\${lsSnapshot}

--- SessionStorage Snapshot ---
\${sessionSnapshot}

--- Browser Info ---
Language: \${navigator.language}
Platform: \${navigator.platform}
Cookies Enabled: \${navigator.cookieEnabled}
--- End of Report ---\`;
}
