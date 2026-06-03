import { SENTRY_DSN, isSentryEnabled } from "../config/env.js";

// Try to load the real Sentry SDK. If @sentry/browser is not installed
// (e.g. the dependency was skipped during npm install), every call below
// is a no-op — the app continues working without remote error reporting.
let Sentry = null;

if (isSentryEnabled && typeof window !== "undefined") {
  try {
    const SentryModule = require("@sentry/browser");
    Sentry = SentryModule;

    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [
        typeof SentryModule.browserTracingIntegration === "function"
          ? SentryModule.browserTracingIntegration()
          : null,
        typeof SentryModule.replayIntegration === "function"
          ? SentryModule.replayIntegration()
          : null,
      ].filter(Boolean),
      tracesSampleRate: 0.25,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE || "development",
    });
  } catch {
    // Sentry SDK unavailable — local-only logging will still work
  }
}

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

function persistToLocalStorage(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
    existing.unshift(entry);
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 10)));
  } catch (_) {
  }
}

export const logError = (error, errorInfo, extra = {}) => {
  try {
    console.group?.("[Eventra ErrorLogger]");
    console.error("[GlobalErrorBoundary]", error);
    if (errorInfo?.componentStack) {
      console.error("[ComponentStack]", errorInfo);
    }
    if (Object.keys(extra).length) {
      console.info("Context:", extra);
    }
    console.groupEnd?.();

    if (Sentry) {
      Sentry.withScope((scope) => {
        if (extra) scope.setExtras(extra);
        if (errorInfo?.componentStack) {
          scope.setExtra("componentStack", errorInfo.componentStack);
        }
        Sentry.captureException(error);
      });
    }

    const entry = buildErrorEntry(error, errorInfo, extra);
    persistToLocalStorage(entry);
  } catch (loggerError) {
    console.warn("[Eventra ErrorLogger] Failed to log error:", loggerError);
  }
};

export const getErrorLog = () => {
  try {
    return JSON.parse(localStorage.getItem("eventra_error_log") || "[]");
  } catch (_) {
    return [];
  }
};

export const clearErrorLog = () => {
  try {
    localStorage.removeItem("eventra_error_log");
    localStorage.removeItem("eventra_feature_errors");
  } catch (_) {}
};
