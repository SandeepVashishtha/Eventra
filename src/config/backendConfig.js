import { resolveBackendUrl, DEV_FALLBACK_URL } from "./backendConfig/envResolver.js";
import { normalizeBackendUrl } from "./backendConfig/urlUtils.js";
import { validateBackendConfig, logValidationErrors } from "./backendConfig/validator.js";
import { isDevelopment, isProduction } from "./backendConfig/envDetector.js";

// ==========================================
// Internal State & Subscriptions
// ==========================================
let runtimeOverrideUrl = null;
const configChangeListeners = new Set();
let healthCache = { status: "UNKNOWN", lastChecked: null, error: null };

/**
 * Resolves the active backend origin considering static resolution and dynamic runtime overrides.
 */
function computeBackendOrigin() {
  const rawUrl = runtimeOverrideUrl || resolveBackendUrl();
  return normalizeBackendUrl(rawUrl);
}

// Initial calculation
let BACKEND_ORIGIN = computeBackendOrigin();
let validation = validateBackendConfig();

logValidationErrors();

// ==========================================
// Core Base URL Computations
// ==========================================
function computeApiBaseUrl(origin) {
  if (!origin) return "";
  const isRelative = origin.startsWith("/");
  if (isRelative) return origin;
  return `${origin.replace(/\/+$/, "")}/api`;
}

function computeSseBaseUrl(origin) {
  if (!origin) return "/";
  const isRelative = origin.startsWith("/");
  if (isRelative) {
    return origin.replace(/\/api\/?$/, "") || "/";
  }
  return origin.replace(/\/+$/, "");
}

export let BACKEND_URL = BACKEND_ORIGIN;
export let API_BASE_URL = computeApiBaseUrl(BACKEND_ORIGIN);
export let SSE_BASE_URL = computeSseBaseUrl(BACKEND_ORIGIN);

// ==========================================
// Feature 1: Dynamic Runtime Overrides & Events
// ==========================================

function updateConfigState() {
  BACKEND_ORIGIN = computeBackendOrigin();
  BACKEND_URL = BACKEND_ORIGIN;
  API_BASE_URL = computeApiBaseUrl(BACKEND_ORIGIN);
  SSE_BASE_URL = computeSseBaseUrl(BACKEND_ORIGIN);
  validation = validateBackendConfig();

  const metadata = getConfigMetadata();
  configChangeListeners.forEach((listener) => {
    try {
      listener(metadata);
    } catch (err) {
      console.error("[Config] Listener error:", err);
    }
  });
}

/**
 * Overrides the target backend URL dynamically at runtime (e.g., multi-tenant switching or testing).
 * @param {string} url - The new backend base URL.
 */
export function setBackendUrlOverride(url) {
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("[Config] Override URL must be a non-empty string.");
  }
  runtimeOverrideUrl = url.trim();
  updateConfigState();
}

/**
 * Clears any dynamic backend URL override and resets to default environment settings.
 */
export function resetBackendUrlOverride() {
  runtimeOverrideUrl = null;
  updateConfigState();
}

/**
 * Subscribes to configuration state changes.
 * @param {Function} listener - Callback invoked with updated config metadata.
 * @returns {Function} Unsubscribe function.
 */
export function onConfigChange(listener) {
  if (typeof listener !== "function") {
    throw new TypeError("[Config] Listener must be a function.");
  }
  configChangeListeners.add(listener);
  return () => configChangeListeners.delete(listener);
}

// ==========================================
// Feature 2: URL & Protocol Builders
// ==========================================

/**
 * Serializes an object or URLSearchParams into a query string.
 */
function buildQueryString(params) {
  if (!params) return "";
  if (typeof params === "string") return params.startsWith("?") ? params : `?${params}`;
  if (params instanceof URLSearchParams) return params.toString() ? `?${params.toString()}` : "";
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) {
        val.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(val));
      }
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}

/**
 * Builds a fully qualified API URL supporting query parameters and versioning.
 * @param {string} path - Relative endpoint path (e.g., "/users" or "v1/auth/login").
 * @param {Object|URLSearchParams} [queryParams] - Query parameters to append.
 * @param {Object} [options] - Options like `{ version: "v1" }`.
 */
export function buildApiUrl(path = "", queryParams = null, options = {}) {
  const cleanPath = path.replace(/^\/+/, "");
  const versionPrefix = options.version ? `${options.version.replace(/^\/+|\/+$/g, "")}/` : "";
  const query = buildQueryString(queryParams);
  const base = API_BASE_URL.replace(/\/+$/, "");
  
  return `${base}/${versionPrefix}${cleanPath}${query}`;
}

/**
 * Converts HTTP(S) backend URLs to WebSocket equivalent (ws:// or wss://).
 * @param {string} path - WebSocket endpoint path.
 * @param {Object} [queryParams] - Query parameters.
 */
export function buildWsUrl(path = "", queryParams = null) {
  const cleanPath = path.replace(/^\/+/, "");
  const query = buildQueryString(queryParams);
  let base = BACKEND_ORIGIN;

  if (base.startsWith("https://")) {
    base = base.replace(/^https:\/\//, "wss://");
  } else if (base.startsWith("http://")) {
    base = base.replace(/^http:\/\//, "ws://");
  } else if (base.startsWith("//")) {
    base = `wss:${base}`;
  } else if (base.startsWith("/")) {
    const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = typeof window !== "undefined" ? window.location.host : "localhost";
    base = `${protocol}//${host}${base}`;
  }

  return `${base.replace(/\/+$/, "")}/${cleanPath}${query}`;
}

/**
 * Builds an SSE (Server-Sent Events) connection URL.
 * @param {string} path - SSE route path.
 * @param {Object} [queryParams] - Query parameters.
 */
export function buildSseUrl(path = "", queryParams = null) {
  const cleanPath = path.replace(/^\/+/, "");
  const query = buildQueryString(queryParams);
  const base = SSE_BASE_URL.replace(/\/+$/, "");
  return `${base}/${cleanPath}${query}`;
}

// ==========================================
// Feature 3: Backend Health Diagnostic Tool
// ==========================================

/**
 * Performs a health check request against the configured backend.
 * @param {Object} [options]
 * @param {string} [options.endpoint="/health"] - Health endpoint path.
 * @param {number} [options.timeoutMs=5000] - Request timeout.
 * @param {boolean} [options.forceRefresh=false] - Bypass cache.
 */
export async function checkBackendHealth(options = {}) {
  const { endpoint = "/health", timeoutMs = 5000, forceRefresh = false } = options;
  const now = Date.now();

  // Return cached result if checked within 10 seconds
  if (!forceRefresh && healthCache.lastChecked && now - healthCache.lastChecked < 10000) {
    return healthCache;
  }

  const targetUrl = buildApiUrl(endpoint);
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined,
    });

    if (timer) clearTimeout(timer);

    const isOk = response.ok;
    healthCache = {
      status: isOk ? "HEALTHY" : "UNHEALTHY",
      statusCode: response.status,
      lastChecked: now,
      error: isOk ? null : `HTTP status ${response.status}`,
    };
  } catch (err) {
    if (timer) clearTimeout(timer);
    healthCache = {
      status: "UNREACHABLE",
      statusCode: null,
      lastChecked: now,
      error: err.name === "AbortError" ? "Request timeout" : err.message || "Network failure",
    };
  }

  return healthCache;
}

/**
 * Returns the current cached health status.
 */
export function getCachedHealthStatus() {
  return { ...healthCache };
}

// ==========================================
// Metadata & Diagnostics
// ==========================================

export function getConfigMetadata() {
  return {
    backendOrigin: BACKEND_ORIGIN,
    apiBaseUrl: API_BASE_URL,
    sseBaseUrl: SSE_BASE_URL,
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    isOverridden: runtimeOverrideUrl !== null,
    devFallbackUrl: DEV_FALLBACK_URL,
    validation,
    health: { ...healthCache },
  };
}

export const CONFIG_METADATA = getConfigMetadata();
export { validateBackendConfig };

/**
 * Logs comprehensive diagnostic report to console for debugging.
 */
export function printConfigDiagnostics() {
  console.group("[Backend Configuration Diagnostics]");
  console.log("BACKEND_ORIGIN:", BACKEND_ORIGIN);
  console.log("API_BASE_URL:    ", API_BASE_URL);
  console.log("SSE_BASE_URL:    ", SSE_BASE_URL);
  console.log("Environment:     ", isDevelopment() ? "Development" : isProduction() ? "Production" : "Unknown");
  console.log("Runtime Override:", runtimeOverrideUrl || "None");
  console.log("Validation State:", validation);
  console.log("Health Status:   ", healthCache);
  console.groupEnd();
}

// ==========================================
// Exports
// ==========================================

export default {
  BACKEND_URL,
  API_BASE_URL,
  SSE_BASE_URL,
  validateBackendConfig,
  CONFIG_METADATA,
  setBackendUrlOverride,
  resetBackendUrlOverride,
  onConfigChange,
  buildApiUrl,
  buildWsUrl,
  buildSseUrl,
  checkBackendHealth,
  getCachedHealthStatus,
  printConfigDiagnostics,
};