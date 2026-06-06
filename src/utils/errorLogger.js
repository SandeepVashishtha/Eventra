import { SENTRY_DSN, isSentryEnabled } from "../config/env.js";
import { safeParseJson } from "./jsonUtils";
import { logger } from "./logger";

// Try to load the real Sentry SDK. If @sentry/browser is not installed
// (e.g. the dependency was skipped during npm install), every call below
// is a no-op — the app continues working without remote error reporting.
let Sentry = null;

if (isSentryEnabled && typeof window !== "undefined") {
  (async () => {
    try {
      const SentryModule = await import("@sentry/browser");
      Sentry = SentryModule.default || SentryModule;

      const runtimeEnv =
        typeof import.meta !== "undefined" && import.meta.env
          ? import.meta.env
          : typeof process !== "undefined" && process.env
            ? process.env
            : {};

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
        environment: runtimeEnv.MODE || runtimeEnv.NODE_ENV || "development",
      });
    } catch {
      // Sentry SDK unavailable — local-only logging will still work
    }
  })();
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
  const existing = safeParseJson(localStorage.getItem("eventra_error_log"), []);
  existing.unshift(entry);
  try {
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 10)));
  } catch (_) {
  }
}

export const logError = (error, errorInfo, extra = {}) => {
  try {
    logger.error("[ErrorLogger]", error);
    if (errorInfo?.componentStack) {
      logger.error("[ComponentStack]", errorInfo);
    }
    if (Object.keys(extra).length) {
      logger.info("[ErrorLogger] Context:", extra);
    }

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
    logger.warn("[Eventra ErrorLogger] Failed to log error:", loggerError);
  }
};

export const persistErrors = (key, entry, maxEntries = 10) => {
  try {
    const storageKey = `eventra_${key}`;
    const existing = safeParseJson(localStorage.getItem(storageKey), []);
    existing.unshift(entry);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, maxEntries)));
  } catch {}
};

export const getErrors = (key) =>
  safeParseJson(localStorage.getItem(`eventra_${key}`), []);

export const clearErrors = (key) => {
  try {
    localStorage.removeItem(`eventra_${key}`);
  } catch {}
};

export const getErrorLog = () =>
  safeParseJson(localStorage.getItem("eventra_error_log"), []);

export const clearErrorLog = () => {
  try {
    localStorage.removeItem("eventra_error_log");
  } catch {}
};
