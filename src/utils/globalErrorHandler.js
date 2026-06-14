import { logError } from "./errorLogger.js";

// Track recent errors to avoid flooding logs with identical stack traces
// that happen in rapid succession (e.g. a render loop).
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 3000;

function isDuplicate(fingerprint) {
  const now = Date.now();
  const lastSeen = recentErrors.get(fingerprint);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(fingerprint, now);

  // Housekeep stale entries so the map doesn't grow without bound
  if (recentErrors.size > 50) {
    for (const [key, ts] of recentErrors) {
      if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(key);
    }
  }
  return false;
}

function buildFingerprint(error) {
  if (!error) return "unknown";
  const msg = typeof error === "string" ? error : error.message || "";
  const stack = error.stack || "";
  // Use the first stack frame + message as the dedup key
  const firstFrame = stack.split("\n").slice(0, 2).join("|");
  return `${msg}::${firstFrame}`;
}

export const initializeGlobalErrorHandling = () => {
  if (typeof window === "undefined") return;

  window.onerror = (message, source, lineno, colno, error) => {
    const fp = buildFingerprint(error || message);
    if (isDuplicate(fp)) return;

    console.error("[GlobalError]", error || message);
    if (error) {
      logError(error, null, { source, lineno, colno });
    }
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const wrapped = reason instanceof Error ? reason : new Error(String(reason));
    const fp = buildFingerprint(wrapped);
    if (isDuplicate(fp)) return;

    console.error("[UnhandledPromiseRejection]", reason);
    logError(wrapped, null, {
      type: "unhandled_promise_rejection",
    });
  };
};
