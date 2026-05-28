const dsn = process.env.REACT_APP_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === "production";
const Sentry = {
  init: () => {},
  browserTracingIntegration: () => null,
  replayIntegration: () => null,
  withScope: () => {},
  captureException: () => {},
};

// ── Sentry initialisation (production only) ───────────────────────────────────
if (isProduction && dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a structured error entry for persistence and reporting.
 */
function buildErrorEntry(error, errorInfo, extra = {}) {
  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    message: error ? error.toString() : "Unknown error",
    stack: error?.stack || "",
    componentStack: errorInfo?.componentStack || "",
    ...extra,
  };
}

/**
 * Persist an error entry to localStorage under `eventra_error_log`.
 * Keeps only the 10 most recent entries and skips sensitive keys.
 * Safe — never throws.
 */
function persistToLocalStorage(entry) {
  try {
    const existing = JSON.parse(
      localStorage.getItem("eventra_error_log") || "[]"
    );
    existing.unshift(entry);
    localStorage.setItem(
      "eventra_error_log",
      JSON.stringify(existing.slice(0, 10))
    );
  } catch (_) {
    // localStorage unavailable or quota exceeded — fail silently
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * logError(error, errorInfo, extra?)
 *
 * Call from any ErrorBoundary's componentDidCatch.
 *
 * - Logs to console in all environments
 * - Persists a structured entry to localStorage (survives a page reload)
 * - Reports to Sentry in production when a DSN is configured
 *
 * @param {Error}      error     The caught error object
 * @param {object}     errorInfo React errorInfo (componentStack)
 * @param {object}     extra     Any additional context (e.g. { section: "Navbar" })
 */
export const logError = (error, errorInfo, extra = {}) => {
  try {
    // ── Console logging ──────────────────────────────────────────
    console.group?.("[Eventra ErrorLogger]");
    console.error("Error:", error);
    if (errorInfo?.componentStack) {
      console.error("Component Stack:", errorInfo.componentStack);
    }
    if (Object.keys(extra).length) {
      console.info("Context:", extra);
    }
    console.groupEnd?.();

    // ── LocalStorage persistence ─────────────────────────────────
    const entry = buildErrorEntry(error, errorInfo, extra);
    persistToLocalStorage(entry);

    // ── Sentry reporting ─────────────────────────────────────────
    if (isProduction && dsn) {
      Sentry.withScope((scope) => {
        if (errorInfo?.componentStack) {
          scope.setExtra("componentStack", errorInfo.componentStack);
        }
        Object.entries(extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
        Sentry.captureException(error);
      });
    }
  } catch (loggerError) {
    // Never let the error logger itself crash the app
    console.warn("[Eventra ErrorLogger] Failed to log error:", loggerError);
  }
};

/**
 * getErrorLog()
 *
 * Retrieve all persisted error entries from localStorage.
 * Useful for including in diagnostic reports.
 *
 * @returns {Array} Array of error entry objects, newest first
 */
export const getErrorLog = () => {
  try {
    return JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
  } catch (_) {
    return [];
  }
};

/**
 * clearErrorLog()
 *
 * Clear all persisted error entries from localStorage.
 */
export const clearErrorLog = () => {
  try {
    localStorage.removeItem("eventra_error_log");
    localStorage.removeItem("eventra_feature_errors");
  } catch (_) {}
};
