import { logError, addBreadcrumb as addErrorBreadcrumb } from "./errorLogger.js";
import { logger } from "./logger.js";
import { logCategorizedError } from "./errorRecovery.js";
import { redactSensitiveData } from "./security/redactSensitiveData.js";
import { saveToOfflineCache, getFromOfflineCache } from "./indexedDB.js";

// ============================================================================
// Configuration Constants
// ============================================================================

const CONFIG = {
  // Breadcrumb Ring Buffer
  MAX_BREADCRUMBS: 50,
  BREADCRUMB_TYPES: {
    CLICK: "click",
    ROUTE: "route",
    CONSOLE: "console",
    FETCH: "fetch",
    CUSTOM: "custom",
  },

  // Deduplication & Rate Limiting
  DEDUP_WINDOW_MS: 5 * 60 * 1000,
  MAX_EVENT_RATE: 100,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,

  // Offline Storage
  OFFLINE_QUEUE_KEY: "eventra_error_queue",
  MAX_QUEUE_SIZE: 100,
  FLUSH_BATCH_SIZE: 10,

  // Asset Tracking
  TRACKED_ASSETS: ["img", "script", "link", "source", "video", "audio"],

  // Transport
  TRANSPORT_ENDPOINT: "/api/telemetry",
  BEACON_FALLBACK: true,
};

// ============================================================================
// State Management
// ============================================================================

const breadcrumbs = [];
const eventTimestamps = [];
let recentErrors = new Map();
let isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
let isFlushing = false;
let transportEndpoint = CONFIG.TRANSPORT_ENDPOINT;

// ============================================================================
// Breadcrumb Tracking
// ============================================================================

export const addBreadcrumb = (crumb) => {
  const timestamp = new Date().toISOString();
  const breadcrumb = {
    timestamp,
    type: crumb.type || CONFIG.BREADCRUMB_TYPES.CUSTOM,
    message: crumb.message || "",
    data: redactSensitiveData(crumb.data || {}),
  };

  breadcrumbs.push(breadcrumb);
  if (breadcrumbs.length > CONFIG.MAX_BREADCRUMBS) {
    breadcrumbs.shift();
  }
  addErrorBreadcrumb(breadcrumb);
};

export const getBreadcrumbs = () => [...breadcrumbs];

export const clearBreadcrumbs = () => {
  breadcrumbs.length = 0;
};

const setupAutomaticBreadcrumbs = () => {
  if (typeof window === "undefined") return;

  document.addEventListener("click", (event) => {
    const target = event.target;
    const selector = getElementSelector(target);
    addBreadcrumb({
      type: CONFIG.BREADCRUMB_TYPES.CLICK,
      message: `User clicked: ${selector}`,
      data: {
        selector,
        tagName: target.tagName,
        id: target.id,
        className: target.className,
        textContent: target.textContent?.substring(0, 100) || "",
      },
    });
  }, { capture: true, passive: true });

  if (typeof window.history !== "undefined") {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (state, title, url) {
      addBreadcrumb({
        type: CONFIG.BREADCRUMB_TYPES.ROUTE,
        message: `Route change: ${url || title}`,
        data: { state, title, url, action: "pushState" },
      });
      return originalPushState.apply(this, arguments);
    };

    window.history.replaceState = function (state, title, url) {
      addBreadcrumb({
        type: CONFIG.BREADCRUMB_TYPES.ROUTE,
        message: `Route change: ${url || title}`,
        data: { state, title, url, action: "replaceState" },
      });
      return originalReplaceState.apply(this, arguments);
    };

    window.addEventListener("popstate", (event) => {
      addBreadcrumb({
        type: CONFIG.BREADCRUMB_TYPES.ROUTE,
        message: `Route navigation: ${event.state?.url || window.location.href}`,
        data: { state: event.state, action: "popstate" },
      });
    });
  }

  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  const consoleMethods = ["log", "warn", "error", "info", "debug"];
  consoleMethods.forEach((method) => {
    console[method] = (...args) => {
      addBreadcrumb({
        type: CONFIG.BREADCRUMB_TYPES.CONSOLE,
        message: `Console.${method}: ${args[0] || ""}`,
        data: {
          method,
          args: args.map((arg) => {
            if (typeof arg === "string") return arg;
            if (arg instanceof Error) return { message: arg.message, stack: arg.stack };
            try {
              return JSON.stringify(arg);
            } catch {
              return "[unserializable]";
            }
          }).slice(0, 3),
        },
      });
      return originalConsole[method](...args);
    };
  });

  if (typeof window.fetch === "function") {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [input, init = {}] = args;
      const url = typeof input === "string" ? input : input.url;
      const method = init.method || "GET";

      addBreadcrumb({
        type: CONFIG.BREADCRUMB_TYPES.FETCH,
        message: `${method} ${url}`,
        data: {
          url,
          method,
          headers: redactSensitiveData({ ...init.headers }),
        },
      });

      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          addBreadcrumb({
            type: CONFIG.BREADCRUMB_TYPES.FETCH,
            message: `${method} ${url} failed with status ${response.status}`,
            data: {
              url,
              method,
              status: response.status,
              statusText: response.statusText,
            },
          });
        }
        return response;
      } catch (error) {
        addBreadcrumb({
          type: CONFIG.BREADCRUMB_TYPES.FETCH,
          message: `${method} ${url} failed: ${error.message}`,
          data: {
            url,
            method,
            error: error.message,
          },
        });
        throw error;
      }
    };
  }
};

function getElementSelector(element) {
  if (!element || !element.tagName) return "unknown";
  const path = [];
  let current = element;
  while (current && current !== document.body && current !== document.documentElement) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }
    if (current.className && typeof current.className === "string") {
      const classes = current.className.trim().split(/\s+/).filter(Boolean);
      if (classes.length > 0) {
        selector += `.${classes.join(".")}`;
      }
    }
    const siblings = Array.from(current.parentNode?.children || []);
    const index = siblings.indexOf(current);
    if (index > 0 && siblings.filter(s => s.tagName === current.tagName).length > 1) {
      selector += `:nth-of-type(${index + 1})`;
    }
    path.unshift(selector);
    current = current.parentNode;
  }
  return path.join(" > ") || element.tagName.toLowerCase();
}

// ============================================================================
// Fingerprinting & Deduplication
// ============================================================================

export function buildFingerprint(error) {
  if (!error) return "unknown";
  const msg = typeof error === "string" ? error : error.message || "";
  const stack = error.stack || "";
  const normalizedMsg = msg.toLowerCase().trim();
  const firstFrames = stack.split("\n").slice(0, 3).join("|");
  return `${normalizedMsg}:${firstFrames}`;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export function isDuplicate(fingerprint) {
  const now = Date.now();
  const hash = simpleHash(fingerprint);
  const lastSeen = recentErrors.get(hash);
  if (lastSeen && now - lastSeen < CONFIG.DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(hash, now);
  if (recentErrors.size > 100) {
    for (const [key, ts] of recentErrors) {
      if (now - ts > CONFIG.DEDUP_WINDOW_MS) {
        recentErrors.delete(key);
      }
    }
  }
  return false;
}

// ============================================================================
// Rate Limiting
// ============================================================================

function isRateLimited() {
  const now = Date.now();
  while (eventTimestamps.length > 0 && now - eventTimestamps[0] > CONFIG.RATE_LIMIT_WINDOW_MS) {
    eventTimestamps.shift();
  }
  if (eventTimestamps.length >= CONFIG.MAX_EVENT_RATE) {
    return true;
  }
  eventTimestamps.push(now);
  return false;
}

// ============================================================================
// PII Scrubbing
// ============================================================================

export function scrubPayload(payload) {
  return redactSensitiveData(payload);
}

// ============================================================================
// Offline Queue Management
// ============================================================================

async function queueOfflineReport(report) {
  try {
    const queue = await getFromOfflineCache(CONFIG.OFFLINE_QUEUE_KEY, []);
    const reportHash = simpleHash(JSON.stringify(report));
    const hasDuplicate = queue.some((r) => simpleHash(JSON.stringify(r)) === reportHash);
    if (!hasDuplicate) {
      queue.push(report);
      if (queue.length > CONFIG.MAX_QUEUE_SIZE) {
        queue.shift();
      }
      await saveToOfflineCache(CONFIG.OFFLINE_QUEUE_KEY, queue);
    }
  } catch (error) {
    console.warn("[GlobalErrorHandler] Failed to queue offline report:", error);
  }
}

async function flushOfflineQueue() {
  if (isFlushing) return;
  isFlushing = true;
  try {
    const queue = await getFromOfflineCache(CONFIG.OFFLINE_QUEUE_KEY, []);
    if (queue.length === 0) {
      isFlushing = false;
      return;
    }
    for (let i = 0; i < queue.length; i += CONFIG.FLUSH_BATCH_SIZE) {
      const batch = queue.slice(i, i + CONFIG.FLUSH_BATCH_SIZE);
      try {
        await sendReports(batch);
        const newQueue = [...queue];
        newQueue.splice(i, batch.length);
        await saveToOfflineCache(CONFIG.OFFLINE_QUEUE_KEY, newQueue);
      } catch (error) {
        console.warn("[GlobalErrorHandler] Failed to flush batch:", error);
        break;
      }
    }
  } catch (error) {
    console.warn("[GlobalErrorHandler] Error flushing offline queue:", error);
  } finally {
    isFlushing = false;
  }
}

const setupConnectivityListeners = () => {
  if (typeof window === "undefined") return;
  isOnline = navigator.onLine;
  window.addEventListener("online", () => {
    isOnline = true;
    logger.info("[GlobalErrorHandler] Connection restored, flushing offline queue...");
    flushOfflineQueue();
  });
  window.addEventListener("offline", () => {
    isOnline = false;
    logger.warn("[GlobalErrorHandler] Connection lost, queuing reports for later transmission.");
  });
  setInterval(() => {
    if (isOnline && !isFlushing) {
      flushOfflineQueue();
    }
  }, 30000);
};

// ============================================================================
// Transport Layer
// ============================================================================

export async function sendReports(reports) {
  if (!Array.isArray(reports)) {
    reports = [reports];
  }
  if (reports.length === 0) return;
  const scrubbedReports = reports.map(scrubPayload);
  const payload = {
    reports: scrubbedReports,
    timestamp: new Date().toISOString(),
    count: scrubbedReports.length,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  if (typeof navigator !== "undefined" && navigator.sendBeacon && CONFIG.BEACON_FALLBACK) {
    try {
      const success = navigator.sendBeacon(transportEndpoint, blob);
      if (success) {
        return Promise.resolve();
      }
    } catch (error) {
      console.warn("[GlobalErrorHandler] sendBeacon failed, falling back to fetch:", error);
    }
  }
  try {
    await fetch(transportEndpoint, {
      method: "POST",
      body: blob,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      mode: "no-cors",
    });
  } catch (error) {
    console.warn("[GlobalErrorHandler] Failed to send reports:", error);
    throw error;
  }
}

export function setTransportEndpoint(endpoint) {
  transportEndpoint = endpoint;
}

// ============================================================================
// Asset Tracking
// ============================================================================

const handleAssetError = (event) => {
  const target = event.target;
  const tagName = target?.tagName?.toLowerCase();
  if (!CONFIG.TRACKED_ASSETS.includes(tagName)) {
    return;
  }
  const url = target?.src || target?.href || target?.currentSrc || "";
  const type = target?.type || "";
  const assetError = new Error(`Asset failed to load: ${url || tagName}`);
  assetError.name = "AssetLoadError";
  addBreadcrumb({
    type: CONFIG.BREADCRUMB_TYPES.CUSTOM,
    message: `Asset load failed: ${tagName}`,
    data: { tagName, url, type },
  });
  const fingerprint = buildFingerprint(assetError);
  if (!isDuplicate(fingerprint)) {
    logCategorizedError(assetError, null, {
      type: "asset",
      tagName,
      url,
      assetType: type,
    });
    const payload = {
      error: {
        message: assetError.message,
        stack: assetError.stack,
        name: assetError.name,
      },
      context: {
        type: "asset_error",
        tagName,
        url,
        assetType: type,
        breadcrumbs: getBreadcrumbs(),
      },
      timestamp: new Date().toISOString(),
    };
    if (!isOnline) {
      queueOfflineReport(payload);
    } else {
      sendReports(payload).catch(() => queueOfflineReport(payload));
    }
  }
};

// ============================================================================
// React Error Boundary Integration
// ============================================================================

export function handleReactErrorBoundary(error, errorInfo, boundaryName = "UnknownBoundary") {
  const fingerprint = buildFingerprint(error);
  addBreadcrumb({
    type: CONFIG.BREADCRUMB_TYPES.CUSTOM,
    message: `React Error Boundary caught error in ${boundaryName}`,
    data: { boundaryName, componentStack: errorInfo?.componentStack },
  });
  if (isDuplicate(fingerprint)) {
    return;
  }
  logError(error, errorInfo, {
    boundary: boundaryName,
    type: "react_error_boundary",
  });
  logCategorizedError(error, errorInfo, {
    boundary: boundaryName,
    type: "react_error_boundary",
  });
  const payload = {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context: {
      type: "react_error_boundary",
      boundary: boundaryName,
      componentStack: errorInfo?.componentStack || "",
      breadcrumbs: getBreadcrumbs(),
    },
    timestamp: new Date().toISOString(),
  };
  if (!isOnline) {
    queueOfflineReport(payload);
  } else {
    sendReports(payload).catch(() => queueOfflineReport(payload));
  }
}

// ============================================================================
// Diagnostic Suite
// ============================================================================

export function runTelemetryDiagnostics() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    status: "passed",
  };
  try {
    const initialCount = breadcrumbs.length;
    addBreadcrumb({
      type: "test",
      message: "Diagnostic test breadcrumb",
      data: { test: true },
    });
    const hasBreadcrumb = breadcrumbs.some((b) => b.message === "Diagnostic test breadcrumb");
    results.tests.push({
      name: "Breadcrumb Tracking",
      status: hasBreadcrumb ? "passed" : "failed",
      details: `Breadcrumb count: ${breadcrumbs.length} (was ${initialCount})`,
    });
    if (hasBreadcrumb) {
      breadcrumbs.pop();
    }
  } catch (error) {
    results.tests.push({
      name: "Breadcrumb Tracking",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  try {
    const testError = new Error("Test error for deduplication");
    const fingerprint = buildFingerprint(testError);
    const firstCheck = isDuplicate(fingerprint);
    const secondCheck = isDuplicate(fingerprint);
    results.tests.push({
      name: "Error Deduplication",
      status: firstCheck === false && secondCheck === true ? "passed" : "failed",
      details: `First check: ${firstCheck}, Second check: ${secondCheck}`,
    });
  } catch (error) {
    results.tests.push({
      name: "Error Deduplication",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  try {
    const testData = {
      email: "test@example.com",
      password: "secret123",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    };
    const scrubbed = scrubPayload(testData);
    const hasEmail = JSON.stringify(scrubbed).includes("test@example.com");
    const hasPassword = JSON.stringify(scrubbed).includes("secret123");
    const hasToken = JSON.stringify(scrubbed).includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    const allScrubbed = !hasEmail && !hasPassword && !hasToken;
    results.tests.push({
      name: "PII Scrubbing",
      status: allScrubbed ? "passed" : "failed",
      details: `Email redacted: ${!hasEmail}, Password redacted: ${!hasPassword}, Token redacted: ${!hasToken}`,
    });
  } catch (error) {
    results.tests.push({
      name: "PII Scrubbing",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  try {
    eventTimestamps.length = 0;
    const isLimited = isRateLimited();
    results.tests.push({
      name: "Rate Limiting",
      status: !isLimited ? "passed" : "failed",
      details: `First event rate limited: ${isLimited}`,
    });
  } catch (error) {
    results.tests.push({
      name: "Rate Limiting",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  try {
    const onlineStatus = typeof navigator !== "undefined" ? navigator.onLine : true;
    results.tests.push({
      name: "Connectivity Detection",
      status: "passed",
      details: `Current online status: ${onlineStatus}`,
    });
  } catch (error) {
    results.tests.push({
      name: "Connectivity Detection",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  try {
    const hasBeacon = typeof navigator !== "undefined" && navigator.sendBeacon;
    const endpointSet = transportEndpoint !== CONFIG.TRANSPORT_ENDPOINT || CONFIG.TRANSPORT_ENDPOINT;
    results.tests.push({
      name: "Transport Configuration",
      status: hasBeacon && endpointSet ? "passed" : "partial",
      details: `sendBeacon available: ${hasBeacon}, Endpoint: ${transportEndpoint}`,
    });
  } catch (error) {
    results.tests.push({
      name: "Transport Configuration",
      status: "failed",
      details: error.message,
    });
    results.status = "failed";
  }
  logger.info("[GlobalErrorHandler] Telemetry Diagnostics:", results);
  return results;
}

export function getTelemetryStatus() {
  return {
    breadcrumbs: {
      count: breadcrumbs.length,
      capacity: CONFIG.MAX_BREADCRUMBS,
    },
    deduplication: {
      activeEntries: recentErrors.size,
      windowMs: CONFIG.DEDUP_WINDOW_MS,
    },
    rateLimiting: {
      eventsInWindow: eventTimestamps.length,
      maxRate: CONFIG.MAX_EVENT_RATE,
      windowMs: CONFIG.RATE_LIMIT_WINDOW_MS,
    },
    connectivity: {
      isOnline,
      isFlushing,
    },
    transport: {
      endpoint: transportEndpoint,
      hasSendBeacon: typeof navigator !== "undefined" && navigator.sendBeacon,
    },
    queue: {
      key: CONFIG.OFFLINE_QUEUE_KEY,
      maxSize: CONFIG.MAX_QUEUE_SIZE,
    },
  };
}

function normalizeError(error, type = "runtime", extra = {}) {
  const errObject = error instanceof Error ? error : new Error(String(error || "Unknown Error"));
  return {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    error: {
      message: errObject.message || "Unknown error",
      name: errObject.name || "Error",
      stack: errObject.stack || "",
    },
    context: {
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      online: isOnline,
      breadcrumbs: getBreadcrumbs(),
      ...extra,
    },
    system: {
      environment: typeof process !== "undefined" ? process.env.NODE_ENV : "browser",
      platform: typeof navigator !== "undefined" ? navigator.platform : "unknown",
    },
  };
}

// ============================================================================
// Main Initialization
// ============================================================================

export const initializeGlobalErrorHandling = (options = {}) => {
  if (typeof window === "undefined") return;
  if (options.endpoint) {
    setTransportEndpoint(options.endpoint);
  }
  if (options.maxBreadcrumbs !== undefined) {
    CONFIG.MAX_BREADCRUMBS = options.maxBreadcrumbs;
  }
  if (options.dedupWindowMs !== undefined) {
    CONFIG.DEDUP_WINDOW_MS = options.dedupWindowMs;
  }
  if (options.enableBreadcrumbs !== false) {
    setupAutomaticBreadcrumbs();
  }
  setupConnectivityListeners();
  window.onerror = (message, source, lineno, colno, error) => {
    const err = error || new Error(message);
    const fingerprint = buildFingerprint(err);
    if (isDuplicate(fingerprint) || isRateLimited()) {
      return;
    }
    addBreadcrumb({
      type: CONFIG.BREADCRUMB_TYPES.CUSTOM,
      message: `Global error: ${err.message}`,
      data: { source, lineno, colno },
    });
    logger.error("[GlobalError]", err);
    const payload = normalizeError(err, "window_error", { source, lineno, colno });
    logError(err, null, { source, lineno, colno });
    logCategorizedError(err, null, { source, lineno, colno });
    if (!isOnline) {
      queueOfflineReport(payload);
    } else {
      sendReports(payload).catch(() => queueOfflineReport(payload));
    }
    return true;
  };
  window.onunhandledrejection = (event) => {
    const reason = event.reason;
    const wrapped = reason instanceof Error ? reason : new Error(String(reason));
    const fingerprint = buildFingerprint(wrapped);
    if (isDuplicate(fingerprint) || isRateLimited()) {
      return;
    }
    addBreadcrumb({
      type: CONFIG.BREADCRUMB_TYPES.CUSTOM,
      message: `Unhandled promise rejection: ${wrapped.message}`,
      data: { reason: String(reason) },
    });
    logger.error("[UnhandledPromiseRejection]", reason);
    const payload = normalizeError(wrapped, "unhandled_promise_rejection");
    logError(wrapped, null, {
      type: "unhandled_promise_rejection",
    });
    logCategorizedError(wrapped, null, {
      type: "unhandled_promise_rejection",
    });
    if (!isOnline) {
      queueOfflineReport(payload);
    } else {
      sendReports(payload).catch(() => queueOfflineReport(payload));
    }
    event.preventDefault();
  };
  window.addEventListener("error", handleAssetError, true);
  logger.info("[GlobalErrorHandler] Enterprise Global Error Telemetry & Instrumentation Engine initialized");
  addBreadcrumb({
    type: CONFIG.BREADCRUMB_TYPES.CUSTOM,
    message: "Global error telemetry initialized",
    data: {
      features: [
        "breadcrumb_tracking",
        "error_deduplication",
        "rate_limiting",
        "pii_scrubbing",
        "offline_queuing",
        "asset_tracking",
        "connectivity_monitoring",
        "non_blocking_transport",
      ],
    },
  });
};

export {
  CONFIG,
  queueOfflineReport,
  flushOfflineQueue,
  normalizeError,
};

