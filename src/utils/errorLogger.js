/**
 * @typedef {Object} ErrorEntry
 * @property {string} timestamp - ISO timestamp of when the error occurred.
 * @property {string} url - The URL where the error happened.
 * @property {string} userAgent - The browser user agent string.
 * @property {string} message - The error message or stringified error.
 * @property {string} [stack] - The error stack trace.
 * @property {string} [componentStack] - React component stack trace (if applicable).
 */

import { SENTRY_DSN, isSentryEnabled } from "../config/env.js";
import { safeParseJson } from "./jsonUtils";
import { logger } from "./logger";

// ... [Existing initialization logic remains the same] ...

/**
 * Builds an error entry object for persistent storage.
 * @param {Error|string} error - The error object or message.
 * @param {Object} [errorInfo] - Optional metadata (e.g., componentStack).
 * @param {Object} [extra] - Additional context to log.
 * @returns {ErrorEntry} The formatted error entry.
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
 * Persists an error to localStorage.
 * @param {ErrorEntry} entry - The error entry to save.
 */
function persistToLocalStorage(entry) {
  const existing = safeParseJson(localStorage.getItem("eventra_error_log"), []);
  existing.unshift(entry);
  try {
    localStorage.setItem("eventra_error_log", JSON.stringify(existing.slice(0, 10)));
  } catch {
    // Silently fail if localStorage is full or restricted
  }
}

/**
 * Logs an error to console, Sentry (if enabled), and local storage.
 * @param {Error} error - The error instance.
 * @param {Object} [errorInfo] - React error information.
 * @param {Object} [extra] - Additional contextual data.
 */
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

/**
 * Persists custom log entries to a specific key in localStorage.
 * @param {string} key - The storage key suffix.
 * @param {Object} entry - The entry data to save.
 * @param {number} [maxEntries=10] - Max number of items to keep.
 */
export const persistErrors = (key, entry, maxEntries = 10) => {
  try {
    const storageKey = `eventra_${key}`;
    const existing = safeParseJson(localStorage.getItem(storageKey), []);
    existing.unshift(entry);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, maxEntries)));
  } catch {}
};

/**
 * Retrieves error logs from localStorage by key.
 * @param {string} key - The storage key suffix.
 * @returns {Array} List of error entries.
 */
export const getErrors = (key) =>
  safeParseJson(localStorage.getItem(`eventra_${key}`), []);

/**
 * Clears error logs for a specific key.
 * @param {string} key - The storage key suffix.
 */
export const clearErrors = (key) => {
  try {
    localStorage.removeItem(`eventra_${key}`);
  } catch {}
};

/**
 * Retrieves the global error log.
 * @returns {Array<ErrorEntry>}
 */
export const getErrorLog = () =>
  safeParseJson(localStorage.getItem("eventra_error_log"), []);

/**
 * Clears the global error log.
 */
export const clearErrorLog = () => {
  try {
    localStorage.removeItem("eventra_error_log");
  } catch {}
};
