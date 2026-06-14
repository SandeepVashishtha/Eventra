import { logError } from "./errorLogger.js";

// Track recent errors to avoid flooding logs with identical stack traces
// that happen in rapid succession (e.g. a render loop).
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 3000;
const MAX_RECENT_ERRORS = 200; // 🔥 FIX: hard cap to prevent unbounded growth

// 🔥 CodeScene refactor: extracted to keep isDuplicate below the
// "Bumpy Road Ahead" threshold (no nested conditional logic).
const sweepStaleEntries = (now) => {
  for (const [key, ts] of recentErrors) {
    if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(key);
  }
};

// 🔥 CodeScene refactor: extracted to keep isDuplicate below the
// "Bumpy Road Ahead" threshold (no nested conditional logic).
const evictOldestEntries = () => {
  const overflow = recentErrors.size - MAX_RECENT_ERRORS;
  let dropped = 0;
  for (const key of recentErrors.keys()) {
    if (dropped >= overflow) break;
    recentErrors.delete(key);
    dropped++;
  }
};

function isDuplicate(fingerprint) {
  const now = Date.now();
  const lastSeen = recentErrors.get(fingerprint);
  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(fingerprint, now);

  // 🔥 FIX: sweep stale entries on EVERY call (cheap O(K) scan over the
  // small map) rather than only when the map exceeds MAX_RECENT_ERRORS.
  // Previously stale entries were never reaped if errors stopped arriving
  // or arrived slowly with different fingerprints.
  sweepStaleEntries(now);

  // Enforce the hard cap by dropping the oldest entries (insertion-order).
  if (recentErrors.size > MAX_RECENT_ERRORS) evictOldestEntries();
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

// 🔥 CodeScene refactor: extracted to deduplicate the onerror / onunhandledrejection
// handler bodies. Both previously repeated the same fingerprint / isDuplicate / log /
// logError sequence with only the log label differing.
const handleReport = (error, message, logLabel, extra) => {
  const fp = buildFingerprint(error || message);
  if (isDuplicate(fp)) return;
  console.error(logLabel, error || message);
  if (error) {
    logError(error, null, extra);
  }
};

export const initializeGlobalErrorHandling = () => {
  if (typeof window === "undefined") return;

  window.onerror = (message, source, lineno, colno, error) => {
    handleReport(error, message, "[GlobalError]", { source, lineno, colno });
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const wrapped = reason instanceof Error ? reason : new Error(String(reason));
    handleReport(wrapped, reason, "[UnhandledPromiseRejection]", {
      type: "unhandled_promise_rejection",
    });
  };
};
