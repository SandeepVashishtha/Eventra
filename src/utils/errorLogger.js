/**
 * @fileoverview errorLogger.js
 * @module utils/errorLogger
 *
 * Centrally manages error logging, local storage error persistence, and optional
 * Sentry integration for real-time remote monitoring. 
 *
 * Implements defensive checks for restricted environments (e.g. environments where
 * localStorage or Sentry SDK might be unavailable or blocked due to security policies).
 * 
 * Strict ES Module (ESM) paths must always include explicit file extensions (.js).
 */

import { SENTRY_DSN, isSentryEnabled } from "../config/env.js";
import { safeParseJson } from "./jsonUtils.js";
import { logger } from "./logger.js";

/**
 * Lazy-loaded reference to the Sentry browser SDK.
 * Dynamically imported only if Sentry is enabled and the runtime is a browser.
 * @type {object|null}
 */
let Sentry = null;

// Initialize Sentry asynchronously to avoid blocking initial application load
if (isSentryEnabled && typeof window !== "undefined") {
  (async () => {
    try {
      // Dynamically import @sentry/browser to minimize bundle size on initial load
      const SentryModule = await import("@sentry/browser");
      Sentry = SentryModule.default || SentryModule;

      const runtimeEnv =
        typeof import.meta !== "undefined" && import.meta.env
          ? import.meta.env
          : typeof process !== "undefined" && process.env
            ? process.env
            : {};

      // Initialize the Sentry client with performance and replay metrics
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
      logger.info("[ErrorLogger] Sentry initialized successfully.");
    } catch (importError) {
      // Fallback: Sentry SDK is missing, failed to load, or blocked by ad-blocker
      logger.warn("[ErrorLogger] Sentry SDK unavailable or failed to initialize. Falling back to local logging.", importError);
    }
  })();
}

/**
 * Builds a standardized error log entry with contextual environment information.
 *
 * @param {Error|null} error - The caught JavaScript error object.
 * @param {object|null} errorInfo - React component stack trace metadata (if applicable).
 * @param {object} [extra={}] - Additional key-value pairs of context.
 * @returns {object} A standardized error entry object.
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
 * Safely persists a standardized error entry to local storage.
 * Ensures that quota errors do not crash the application.
 *
 * @param {object} entry - The error entry object to append.
 */
function persistToLocalStorage(entry) {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) {
      return;
    }
    const rawData = localStorage.getItem("eventra_error_log");
    const existing = safeParseJson(rawData, []);
    
    // Add new error to the top of the queue
    existing.unshift(entry);
    
    // Cap log history size at 10 to conserve space
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 10)));
  } catch (storageError) {
    // Graceful fallback for quota exceeded or storage blocked
    logger.warn("[ErrorLogger] Failed to write error log to localStorage:", storageError);
  }
}

/**
 * Logs an error to standard console logger, optional Sentry server, and localStorage.
 *
 * @param {Error} error - The caught Error object.
 * @param {object} [errorInfo] - Optional React component stack or lifecycle metadata.
 * @param {object} [extra={}] - Optional key-value pairs of context variables.
 */
export const logError = (error, errorInfo, extra = {}) => {
  try {
    // 1. Output to local logger
    logger.error("[ErrorLogger] Caught exception:", error);
    if (errorInfo?.componentStack) {
      logger.error("[ComponentStack] React lifecycle traceback:", errorInfo.componentStack);
    }
    if (extra && Object.keys(extra).length) {
      logger.info("[ErrorLogger] Accompanying metadata context:", extra);
    }

    // 2. Transmit details to Sentry if integration is active
    if (Sentry) {
      Sentry.withScope((scope) => {
        if (extra) {
          scope.setExtras(extra);
        }
        if (errorInfo?.componentStack) {
          scope.setExtra("componentStack", errorInfo.componentStack);
        }
        Sentry.captureException(error);
      });
    }

    // 3. Persist log locally for UI debugging capabilities
    const entry = buildErrorEntry(error, errorInfo, extra);
    persistToLocalStorage(entry);
  } catch (loggerError) {
    // Fail-safe to avoid throwing errors during error handling
    logger.warn("[ErrorLogger] Failed to process logError pipeline:", loggerError);
  }
};

/**
 * Persist feature-specific or module-specific errors to localStorage.
 *
 * @param {string} key - Unique key identifier (e.g. 'auth', 'payment').
 * @param {object} entry - Standardized or custom error metadata object.
 * @param {number} [maxEntries=10] - Maximum capacity limit before slicing queue.
 */
export const persistErrors = (key, entry, maxEntries = 10) => {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) return;
    const storageKey = `eventra_${key}`;
    const rawData = localStorage.getItem(storageKey);
    const existing = safeParseJson(rawData, []);
    
    existing.unshift(entry);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, maxEntries)));
  } catch (error) {
    logger.warn(`[ErrorLogger] Failed to persist errors for key '${key}':`, error);
  }
};

/**
 * Reads feature-specific errors from localStorage.
 *
 * @param {string} key - Unique key identifier.
 * @returns {Array} List of logged error entries.
 */
export const getErrors = (key) => {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) return [];
    return safeParseJson(localStorage.getItem(`eventra_${key}`), []);
  } catch {
    return [];
  }
};

/**
 * Clears feature-specific errors from localStorage.
 *
 * @param {string} key - Unique key identifier.
 */
export const clearErrors = (key) => {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) return;
    localStorage.removeItem(`eventra_${key}`);
  } catch (error) {
    logger.warn(`[ErrorLogger] Failed to clear errors for key '${key}':`, error);
  }
};

/**
 * Retrieves the general system error log entries.
 *
 * @returns {Array} List of general error logs.
 */
export const getErrorLog = () => {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) return [];
    return safeParseJson(localStorage.getItem("eventra_error_log"), []);
  } catch {
    return [];
  }
};

/**
 * Clears the general system error log entries.
 */
export const clearErrorLog = () => {
  try {
    if (typeof localStorage === "undefined" || localStorage === null) return;
    localStorage.removeItem("eventra_error_log");
  } catch (error) {
    logger.warn("[ErrorLogger] Failed to clear general error log:", error);
  }
};
