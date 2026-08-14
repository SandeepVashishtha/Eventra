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
import { logger, isDevelopment } from "./logger.js";

/**
 * Eventra Telemetry, Error Logging & Remote Diagnostics Engine
 *
 * Provides resilient multi-tier error logging with optional Sentry SDK integration,
 * local storage fallback queues, deduplication, breadcrumb tracking, offline persistence,
 * and automated global unhandled exception capturing.
 */

// ============================================================================
// 1. Constants & Module State
// ============================================================================

const STORAGE_KEYS = {
  ERROR_LOG: "eventra_error_log",
  FEATURE_ERRORS: "eventra_feature_errors",
  OFFLINE_QUEUE: "eventra_offline_error_queue",
};

const LOG_LIMITS = {
  MAX_LOCAL_ERRORS: 20,
  MAX_FEATURE_ERRORS: 10,
  MAX_OFFLINE_QUEUE: 50,
  DEDUPE_WINDOW_MS: 5000,
};

let Sentry = null;
let isInitialized = false;
let userContext = null;
const globalTags = new Map();
const globalExtras = new Map();
const recentErrorHashes = new Map();
const internalBreadcrumbs = [];
const MAX_BREADCRUMBS = 20;

// ============================================================================
// 2. Sentry Initialization & SDK Loader
// ============================================================================

// Initialize Sentry asynchronously to avoid blocking initial application load
if (isSentryEnabled && typeof window !== "undefined") {
  (async () => {
    try {
      // Dynamically import @sentry/browser to minimize bundle size on initial load
      const SentryModule = await import("@sentry/browser");
      Sentry = SentryModule.default || SentryModule;

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
      environment: process.env.NODE_ENV || "development",
    });

    isInitialized = true;
    } catch {
      // Sentry SDK unavailable — local fallback logging remains active
    }
  })();
}

// ============================================================================
// 3. Helper Functions & Metadata Extraction
// ============================================================================

/**
 * Generates a simple hash string for error deduplication.
 *
 * @param {string} str - Error payload representation.
 * @returns {string} Unique numeric string hash.
 */
function simpleHash(str) {
  const safeStr = typeof str === "string" ? str : String(str || "");
  let hash = 0;
  for (let i = 0; i < safeStr.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

/**
 * Evaluates whether an error is duplicate within the deduplication window.
 *
 * @param {string} errorKey - Unique error string key.
 * @returns {boolean} True if suppressed as duplicate.
 */
function isDuplicateError(errorKey) {
  const now = Date.now();
  const hash = simpleHash(errorKey);

  if (recentErrorHashes.has(hash)) {
    const lastSeen = recentErrorHashes.get(hash);
    if (now - lastSeen < LOG_LIMITS.DEDUPE_WINDOW_MS) {
      return true;
    }
  }

  recentErrorHashes.set(hash, now);
  
  // Cleanup old hashes periodically
  if (recentErrorHashes.size > 100) {
    recentErrorHashes.forEach((timestamp, key) => {
      if (now - timestamp > LOG_LIMITS.DEDUPE_WINDOW_MS) {
        recentErrorHashes.delete(key);
      }
    });
  }

  return false;
}

/**
 * Extracts environment metrics from browser window/navigator.
 *
 * @returns {Object} System context metadata.
 */
function getSystemMetadata() {
  if (typeof window === "undefined") {
    return { environment: "node-ssr" };
  }

  return {
    url: window.location.href,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent || "",
    language: navigator.language || "",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: window.screen ? `${window.screen.width}x${window.screen.height}` : "unknown",
    online: navigator.onLine !== undefined ? navigator.onLine : true,
    memory: performance?.memory
      ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
        }
      : undefined,
  };
}

/**
 * Constructs a standardized JSON error log entry payload.
 *
 * @param {Error|unknown} error - Caught error object.
 * @param {Object} [errorInfo] - React component stack or lifecycle info.
 * @param {Object} [extra] - Supplemental context metadata.
 * @param {string} [severity="error"] - Log level severity.
 * @returns {Object} Structured error entry payload.
 */
function buildErrorEntry(error, errorInfo, extra = {}, severity = "error") {
  const errObject = error instanceof Error ? error : new Error(String(error || "Unknown Error"));

  return {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    severity,
    message: errObject.message || "Unknown error",
    name: errObject.name || "Error",
    stack: errObject.stack || "",
    componentStack: errorInfo?.componentStack || "",
    user: userContext,
    tags: Object.fromEntries(globalTags),
    breadcrumbs: [...internalBreadcrumbs],
    system: getSystemMetadata(),
    extra: {
      ...Object.fromEntries(globalExtras),
      ...extra,
    },
  };
}

// ============================================================================
// 4. Persistence & Local Storage Layer
// ============================================================================

/**
 * Safely writes an entry to LocalStorage with bounded queue limits.
 *
 * @param {string} key - Storage key.
 * @param {Object} entry - Log payload entry.
 * @param {number} maxItems - Maximum items retained.
 */
function persistToLocalStorage(key, entry, maxItems) {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(entry);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, maxItems)));
  } catch (e) {
    console.warn("[Eventra ErrorLogger] LocalStorage write failed:", e);
  }
}

/**
 * Safely reads JSON array entries from LocalStorage.
 *
 * @param {string} key - Storage key.
 * @returns {Array<Object>} Stored entries array.
 */
function readFromLocalStorage(key) {
  if (typeof window === "undefined" || !window.localStorage) return [];

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// 5. Breadcrumb & User Context Management
// ============================================================================

/**
 * Records a lightweight breadcrumb for contextual tracking.
 *
 * @param {Object|string} crumb - Breadcrumb payload or message string.
 */
export const addBreadcrumb = (crumb) => {
  const breadcrumb = typeof crumb === "string"
    ? { message: crumb, timestamp: new Date().toISOString() }
    : { timestamp: new Date().toISOString(), ...crumb };

  internalBreadcrumbs.push(breadcrumb);
  if (internalBreadcrumbs.length > MAX_BREADCRUMBS) {
    internalBreadcrumbs.shift();
  }

  if (Sentry) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

/**
 * Binds active user identity to all subsequent error logs.
 *
 * @param {Object} user - User profile object.
 */
export const setUserContext = (user) => {
  userContext = user
    ? { id: user.id, email: user.email, role: user.role }
    : null;

  if (Sentry) {
    Sentry.setUser(userContext);
  }
};

/**
 * Clears active user context state.
 */
export const clearUserContext = () => {
  userContext = null;
  if (Sentry) {
    Sentry.setUser(null);
  }
};

/**
 * Sets a global tag key-value pair for error telemetry filtering.
 *
 * @param {string} key - Tag name.
 * @param {string} value - Tag value.
 */
export const setTag = (key, value) => {
  globalTags.set(key, String(value));
  if (Sentry) {
    Sentry.setTag(key, value);
  }
};

/**
 * Sets persistent extra metadata key-value pairs.
 *
 * @param {string} key - Metadata key.
 * @param {*} value - Metadata value.
 */
export const setExtraContext = (key, value) => {
  globalExtras.set(key, value);
  if (Sentry) {
    Sentry.setExtra(key, value);
  }
};

// ============================================================================
// 6. Core Logging API
// ============================================================================

/**
 * Logs an error to console, local storage, and remote Sentry SDK.
 *
 * @param {Error|unknown} error - Error instance or message.
 * @param {Object} [errorInfo] - Component error stack information.
 * @param {Object} [extra] - Additional context payload.
 * @param {string} [severity="error"] - Log level severity.
 */
export const logError = (error, errorInfo = null, extra = {}, severity = "error") => {
  try {
    const errorMsg = error?.message || String(error || "");
    const dedupeKey = `${errorMsg}:${errorInfo?.componentStack || ""}`;

    if (isDuplicateError(dedupeKey)) {
      return;
    }

    // Dev Console Formatting
    console.group?.(`[Eventra ErrorLogger] [${severity.toUpperCase()}]`);
    console.error("[Error]", error);
    if (errorInfo?.componentStack) {
      console.error("[ComponentStack]", errorInfo.componentStack);
    }
    if (Object.keys(extra).length) {
      console.info("[Extra Context]", extra);
    }

    // Sentry SDK Dispatch
    if (Sentry) {
      Sentry.withScope((scope) => {
        scope.setLevel(severity);
        if (userContext) scope.setUser(userContext);
        
        globalTags.forEach((val, key) => scope.setTag(key, val));
        globalExtras.forEach((val, key) => scope.setExtra(key, val));

        if (extra) {
          Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
        }

        if (errorInfo?.componentStack) {
          scope.setExtra("componentStack", errorInfo.componentStack);
        }

        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(String(error), severity);
        }
      });
    }

    // Local Storage Fallback Persistence
    const entry = buildErrorEntry(error, errorInfo, extra, severity);
    persistToLocalStorage(STORAGE_KEYS.ERROR_LOG, entry, LOG_LIMITS.MAX_LOCAL_ERRORS);
  } catch (loggerError) {
    console.warn("[Eventra ErrorLogger] Critical error inside logging pipeline:", loggerError);
  }
};

/**
 * Logs warning level messages.
 *
 * @param {string} message - Warning message string.
 * @param {Object} [extra] - Supplemental context payload.
 */
export const logWarning = (message, extra = {}) => {
  logError(new Error(message), null, extra, "warning");
};

/**
 * Logs feature-specific errors into dedicated storage namespaces.
 *
 * @param {string} featureName - Feature or module namespace.
 * @param {Error|unknown} error - Error instance.
 * @param {Object} [extra] - Context data.
 */
export const logFeatureError = (featureName, error, extra = {}) => {
  const enrichedExtra = { feature: featureName, ...extra };
  logError(error, null, enrichedExtra, "error");

  try {
    const entry = buildErrorEntry(error, null, enrichedExtra, "error");
    const rawMap = readFromLocalStorage(STORAGE_KEYS.FEATURE_ERRORS);
    const featureLogs = Array.isArray(rawMap) ? {} : rawMap;

    featureLogs[featureName] = featureLogs[featureName] || [];
    featureLogs[featureName].unshift(entry);
    featureLogs[featureName] = featureLogs[featureName].slice(0, LOG_LIMITS.MAX_FEATURE_ERRORS);

    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEYS.FEATURE_ERRORS, JSON.stringify(featureLogs));
    }
  } catch (e) {
    console.warn("[Eventra ErrorLogger] Failed to persist feature error:", e);
  }
};

/**
 * Specialized logger for network API errors.
 *
 * @param {Object} requestConfig - Request details (url, method, params).
 * @param {Object|Error} errorResponse - API error response or Error instance.
 */
export const logNetworkError = (requestConfig, errorResponse) => {
  const extra = {
    network: {
      url: requestConfig?.url,
      method: requestConfig?.method,
      status: errorResponse?.status || errorResponse?.response?.status,
      statusText: errorResponse?.statusText || errorResponse?.response?.statusText,
      responseData: errorResponse?.data || errorResponse?.response?.data,
    },
  };

  logError(
    new Error(`[Network Error] ${requestConfig?.method || "GET"} ${requestConfig?.url || "unknown"}`),
    null,
    extra,
    "error"
  );
};

// ============================================================================
// 7. Global Exception Listeners & Initialization
// ============================================================================

/**
 * Attaches window.onerror and unhandledrejection handlers for automatic capture.
 */
export const initGlobalErrorHandlers = () => {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    logError(event.error || event.message, null, {
      source: "window.onerror",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason || "Unhandled Promise Rejection", null, {
      source: "window.unhandledrejection",
    });
  });
};

// Auto-initialize listeners on client side
if (typeof window !== "undefined") {
  initGlobalErrorHandlers();
}

// ============================================================================
// 8. Log Inspection, Retrieval & Export
// ============================================================================

/**
 * Retrieves general error logs stored locally.
 *
 * @returns {Array<Object>} Log entries.
 */
export const getErrorLog = () => {
  return readFromLocalStorage(STORAGE_KEYS.ERROR_LOG);
};

/**
 * Retrieves logs scoped to a specific feature namespace.
 *
 * @param {string} featureName - Target feature namespace.
 * @returns {Array<Object>} Feature log entries.
 */
export const getFeatureErrorLog = (featureName) => {
  const logs = readFromLocalStorage(STORAGE_KEYS.FEATURE_ERRORS);
  if (!logs || Array.isArray(logs) || typeof logs !== "object") return [];
  return logs[featureName] || [];
};

/**
 * Clears stored local error logs.
 */
export const clearErrorLog = () => {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.ERROR_LOG);
    localStorage.removeItem(STORAGE_KEYS.FEATURE_ERRORS);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  } catch (_) {
    // Ignore storage clear failures
  }
};

/**
 * Triggers a file download containing formatted error diagnostic logs.
 */
export const exportErrorLogAsJSON = () => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const logs = getErrorLog();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `eventra-error-logs-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export default logError;
export { persistToLocalStorage as persistErrors };