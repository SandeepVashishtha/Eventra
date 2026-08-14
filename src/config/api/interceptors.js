import { syncServerTimeFromHeader } from "../../utils/timeSync.js";
import { getCSRFToken, requiresCSRF, getCSRFEnforcementMode } from "../../utils/csrfToken.js";
import { signRequest } from "../../utils/requestSigner.js";
import { logger } from "../../utils/logger.js";
import { ApiError, RateLimitError, CSRFError } from "./errors.js";
import { logCategorizedError } from "../../utils/errorRecovery.js";

const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const RETRYABLE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

const SIGNED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
// Never read VITE_* here. Vite inlines those into the browser bundle, which
// would make HMAC request signing forgeable by anyone who opens DevTools.
const REQUEST_SIGNING_SECRET_KEY = "REQUEST_SIGNING_SECRET";

const getRequestSigningSecret = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[REQUEST_SIGNING_SECRET_KEY] || "";
  }
  return "";
};

const isSignableBody = (data) =>
  data != null && !(typeof FormData !== "undefined" && data instanceof FormData);

const signRequestConfig = async (config) => {
  const method = config.method?.toUpperCase();
  const secret = getRequestSigningSecret();

  if (!SIGNED_METHODS.has(method) || !secret || !isSignableBody(config.data)) {
    return config;
  }

  try {
    const { timestamp, nonce, signature } = await signRequest(config.data, secret);
    config.headers["x-timestamp"] = timestamp;
    config.headers["x-nonce"] = nonce;
    config.headers["x-signature"] = signature;
  } catch (error) {
    logger.security("request_signing_failed", {
      method,
      url: config.url || "unknown",
      error: error?.message || String(error),
    });
  }

  return config;
};

let onUnauthorized = null;
let _onRequiresReauth = null;
let _reauthRequired = false;

let _authToken = null;
let _refreshToken = null;

export const setOnUnauthorizedHandler = (handler) => { onUnauthorized = handler; };
export const setOnRequiresReauthHandler = (handler) => { _onRequiresReauth = handler; };
export const setReauthRequired = (value) => { _reauthRequired = Boolean(value); };
export const isReauthRequired = () => _reauthRequired;
export const setAuthToken = (token) => { _authToken = token; };
export const setRefreshToken = (token) => { _refreshToken = token; };
export const getRefreshToken = () => _refreshToken;

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const isReauthUrl = (url) => typeof url === "string" && url.includes("/auth/reauth");

const assertReauthAllowsRequest = (config) => {
  const method = config.method?.toUpperCase();
  if (_reauthRequired && MUTATING_METHODS.has(method) && !isReauthUrl(config.url)) {
    throw new ApiError("Re-authentication required before this action can continue.", {
      status: 401,
      data: { code: "REQUIRES_REAUTH" },
    });
  }
};

// ============================================================================
// 1. CONCURRENT REFRESH LOCK & REQUEST QUEUE (MUTEX)
// ============================================================================

class RefreshTokenMutex {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  subscribe(resolve, reject) {
    this.failedQueue.push({ resolve, reject });
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }
}

const refreshTokenMutex = new RefreshTokenMutex();

// ============================================================================
// 2. IN-FLIGHT REQUEST DEDUPLICATOR
// ============================================================================

class RequestDeduplicator {
  constructor() {
    this.inFlightRequests = new Map();
  }

  getCacheKey(config) {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    const params = JSON.stringify(config.params || {});
    return `${method}:${url}:${params}`;
  }

  execute(config, fetcher) {
    const key = this.getCacheKey(config);

    if (config.method?.toUpperCase() !== "GET" || config.skipDeduplication) {
      return fetcher();
    }

    if (this.inFlightRequests.has(key)) {
      logger.info(`[Deduplicator] Collapsing duplicate in-flight GET request: ${key}`);
      return this.inFlightRequests.get(key);
    }

    const promise = fetcher().finally(() => {
      this.inFlightRequests.delete(key);
    });

    this.inFlightRequests.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// ============================================================================
// 3. STALE-WHILE-REVALIDATE (SWR) & ETAG CACHE ENGINE
// ============================================================================

class ApiCacheEngine {
  constructor(defaultTTL = 60_000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    this.taggedKeys = new Map();
  }

  generateKey(config) {
    const method = config.method?.toUpperCase() || "GET";
    const url = config.url || "";
    const params = JSON.stringify(config.params || {});
    return `cache:${method}:${url}:${params}`;
  }

  get(config) {
    const key = this.generateKey(config);
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() > cached.expiresAt;
    return { ...cached, isStale: isExpired };
  }

  set(config, response, options = {}) {
    if (config.method?.toUpperCase() !== "GET") return;

    const key = this.generateKey(config);
    const ttl = options.ttl || this.defaultTTL;
    const etag = response.headers?.etag || response.headers?.get?.("etag") || null;

    const entry = {
      data: response.data,
      status: response.status,
      headers: response.headers,
      etag,
      expiresAt: Date.now() + ttl,
      updatedAt: Date.now(),
    };

    this.cache.set(key, entry);

    if (options.tags && Array.isArray(options.tags)) {
      options.tags.forEach((tag) => {
        if (!this.taggedKeys.has(tag)) this.taggedKeys.set(tag, new Set());
        this.taggedKeys.get(tag).add(key);
      });
    }
  }

  invalidateTag(tag) {
    if (this.taggedKeys.has(tag)) {
      const keys = this.taggedKeys.get(tag);
      keys.forEach((key) => this.cache.delete(key));
      this.taggedKeys.delete(tag);
      logger.info(`[ApiCache] Invalidated cache tag: ${tag}`);
    }
  }

  clear() {
    this.cache.clear();
    this.taggedKeys.clear();
  }
}

export const apiCacheEngine = new ApiCacheEngine();

// ============================================================================
// 4. CIRCUIT BREAKER STATE MACHINE
// ============================================================================

export const CircuitState = Object.freeze({
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  HALF_OPEN: "HALF_OPEN",
});

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30_000;
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  canExecute() {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
        logger.warn("[CircuitBreaker] Transitioning to HALF_OPEN state.");
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN allows test probe
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info("[CircuitBreaker] Circuit successfully recovered to CLOSED.");
    }
  }

  onFailure(status) {
    if (status && status < 500 && status !== 429) return; // Ignore client 4xx errors

    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold || this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.error(
        `[CircuitBreaker] Threshold breached. Circuit OPEN until ${new Date(this.nextAttempt).toISOString()}`
      );
    }
  }
}

export const globalCircuitBreaker = new CircuitBreaker();

// ============================================================================
// 5. TOKEN BUCKET CLIENT-SIDE RATE LIMITER
// ============================================================================

class ClientRateLimiter {
  constructor(capacity = 20, fillRatePerSec = 5) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.fillRate = fillRatePerSec;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const deltaSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + deltaSec * this.fillRate);
    this.lastRefill = now;
  }

  async acquire() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    const waitMs = Math.ceil((1 - this.tokens) / (this.fillRate / 1000));
    logger.warn(`[ClientRateLimiter] Throttling request client-side for ${waitMs}ms`);
    await new Promise((res) => setTimeout(res, waitMs));
    return this.acquire();
  }
}

export const clientRateLimiter = new ClientRateLimiter();

// ============================================================================
// 6. OFFLINE QUEUE & REPLAY ENGINE
// ============================================================================

class OfflineRequestQueue {
  constructor() {
    this.storageKey = "eventra_offline_request_queue_v1";
    this.queue = this.load();
    this.isProcessing = false;

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.replayQueue());
    }
  }

  load() {
    try {
      if (typeof localStorage === "undefined") return [];
      return JSON.parse(localStorage.getItem(this.storageKey) || "[]");
    } catch {
      return [];
    }
  }

  save() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      }
    } catch (e) {
      logger.error("[OfflineQueue] Failed to save offline requests", e);
    }
  }

  enqueue(config) {
    if (!MUTATING_METHODS.has(config.method?.toUpperCase())) return;

    const payload = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
      createdAt: new Date().toISOString(),
    };

    this.queue.push(payload);
    this.save();
    logger.info(`[OfflineQueue] Enqueued offline mutation (${payload.method} ${payload.url})`);
  }

  async replayQueue(apiInstance) {
    if (this.isProcessing || this.queue.length === 0 || !apiInstance) return;
    this.isProcessing = true;
    logger.info(`[OfflineQueue] Connection restored. Replaying ${this.queue.length} buffered requests...`);

    const pending = [...this.queue];
    this.queue = [];
    this.save();

    for (const item of pending) {
      try {
        await apiInstance({
          url: item.url,
          method: item.method,
          data: item.data,
          headers: { ...item.headers, "X-Eventra-Replayed-Request": "true" },
        });
        logger.info(`[OfflineQueue] Successfully replayed: ${item.method} ${item.url}`);
      } catch (err) {
        logger.error(`[OfflineQueue] Replay failed for ${item.method} ${item.url}`, err);
      }
    }
    this.isProcessing = false;
  }
}

export const offlineRequestQueue = new OfflineRequestQueue();

// ============================================================================
// 7. TELEMETRY & NETWORK METRICS MONITOR
// ============================================================================

class ApiTelemetryTracker {
  constructor() {
    this.metrics = new Map();
  }

  record(config, durationMs, success, status) {
    const key = `${config.method?.toUpperCase() || "GET"} ${config.url || "unknown"}`;
    const stats = this.metrics.get(key) || {
      calls: 0,
      failures: 0,
      totalDuration: 0,
      minLatency: Infinity,
      maxLatency: 0,
      statusCodes: {},
    };

    stats.calls += 1;
    if (!success) stats.failures += 1;
    stats.totalDuration += durationMs;
    stats.minLatency = Math.min(stats.minLatency, durationMs);
    stats.maxLatency = Math.max(stats.maxLatency, durationMs);
    stats.statusCodes[status || "NETWORK_ERROR"] = (stats.statusCodes[status || "NETWORK_ERROR"] || 0) + 1;

    this.metrics.set(key, stats);
  }

  getReport() {
    const report = {};
    this.metrics.forEach((v, k) => {
      report[k] = {
        calls: v.calls,
        failures: v.failures,
        avgLatencyMs: Math.round(v.totalDuration / v.calls),
        minLatencyMs: v.minLatency,
        maxLatencyMs: v.maxLatency,
        statusCodes: v.statusCodes,
      };
    });
    return report;
  }
}

export const apiTelemetryTracker = new ApiTelemetryTracker();

// ============================================================================
// 8. MIDDLEWARE PIPELINE ENGINE
// ============================================================================

class MiddlewarePipeline {
  constructor() {
    this.beforeHooks = [];
    this.afterHooks = [];
    this.errorHooks = [];
  }

  useBefore(fn) { this.beforeHooks.push(fn); }
  useAfter(fn) { this.afterHooks.push(fn); }
  useError(fn) { this.errorHooks.push(fn); }

  async runBefore(config) {
    let current = config;
    for (const hook of this.beforeHooks) {
      current = (await hook(current)) || current;
    }
    return current;
  }

  async runAfter(response) {
    let current = response;
    for (const hook of this.afterHooks) {
      current = (await hook(current)) || current;
    }
    return current;
  }

  async runError(error) {
    for (const hook of this.errorHooks) {
      await hook(error);
    }
  }
}

export const middlewarePipeline = new MiddlewarePipeline();

// ============================================================================
// 9. MOCK & SANDBOX ADAPTER
// ============================================================================

class ApiMockRegistry {
  constructor() {
    this.handlers = new Map();
    this.enabled = false;
  }

  enable() { this.enabled = true; }
  disable() { this.enabled = false; }

  mock(method, urlPattern, handler) {
    const key = `${method.toUpperCase()}:${urlPattern}`;
    this.handlers.set(key, handler);
  }

  match(config) {
    if (!this.enabled) return null;
    const method = config.method?.toUpperCase();
    const url = config.url;

    for (const [key, handler] of this.handlers.entries()) {
      const [m, pattern] = key.split(":");
      if (m === method && (url === pattern || url?.includes(pattern))) {
        return handler;
      }
    }
    return null;
  }
}

export const apiMockRegistry = new ApiMockRegistry();

// ============================================================================
// EXISTING / UPGRADED INTERCEPTORS
// ============================================================================

export const createRequestInterceptor = (isDev) => async (config) => {
  assertReauthAllowsRequest(config);

  if (!globalCircuitBreaker.canExecute()) {
    throw new ApiError("Circuit breaker is OPEN. Requests blocked to protect service.", {
      status: 503,
      data: { code: "CIRCUIT_OPEN" },
    });
  }

  await clientRateLimiter.acquire();

  config._startTime = Date.now();
  config = await middlewarePipeline.runBefore(config);

  const mockHandler = apiMockRegistry.match(config);
  if (mockHandler) {
    logger.info(`[MockEngine] Intercepting ${config.method} ${config.url}`);
    const mockData = await mockHandler(config);
    config.adapter = async () => ({
      data: mockData,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  }

  if (isDev) {
    logger.info(`[API ${config.method?.toUpperCase()}]`, config.url || "");
  }

  if (_authToken && _authToken !== "cookie-managed") {
    config.headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const cached = apiCacheEngine.get(config);
  if (cached && !cached.isStale && !config.bypassCache) {
    logger.info(`[ApiCache] Cache hit for ${config.url}`);
    config.adapter = async () => ({
      data: cached.data,
      status: cached.status,
      headers: { ...cached.headers, "x-from-cache": "true" },
      config,
    });
    return config;
  }

  if (cached?.etag) {
    config.headers["If-None-Match"] = cached.etag;
  }

  const method = config.method?.toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCSRFToken();
    if (csrf) {
      config.headers["X-CSRF-Token"] = csrf;
    } else if (process.env.NODE_ENV !== "production") {
      console.warn("[CSRF] Token missing for mutating request:", method, config.url);
    }

    if (!config.headers["Idempotency-Key"]) {
      config.headers["Idempotency-Key"] =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = (Math.random() * 16) | 0;
              return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
            });
    }
  }
  return signRequestConfig(config);
};

export const createResponseInterceptor = (API) => {
  const fulfill = async (response) => {
    const duration = Date.now() - (response.config._startTime || Date.now());
    apiTelemetryTracker.record(response.config, duration, true, response.status);
    globalCircuitBreaker.onSuccess();

    if (response.status === 304) {
      const cached = apiCacheEngine.get(response.config);
      if (cached) {
        response.data = cached.data;
        response.status = 200;
      }
    } else {
      apiCacheEngine.set(response.config, response, response.config.cacheOptions);
    }

    const headerValue =
      response.headers?.["x-server-time"] ||
      response.headers?.["date"] ||
      (typeof response.headers?.get === "function"
        ? response.headers.get("x-server-time") || response.headers.get("date")
        : null);

    if (headerValue) syncServerTimeFromHeader(headerValue);
    return middlewarePipeline.runAfter(response);
  };

  const reject = async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;
    const errorCode = error?.response?.data?.code;
    const duration = Date.now() - (config._startTime || Date.now());

    apiTelemetryTracker.record(config, duration, false, status);
    globalCircuitBreaker.onFailure(status);
    await middlewarePipeline.runError(error);

    if (!error.response && typeof window !== "undefined" && !navigator.onLine) {
      offlineRequestQueue.enqueue(config);
    }

    if (status === 401) {
      if (errorCode === "REQUIRES_REAUTH" && _onRequiresReauth) {
        _reauthRequired = true;
        _onRequiresReauth();
      } else if (onUnauthorized) {
        onUnauthorized();
      }
    }

    const retryCount = config._retryCount || 0;
    const isNonMutating = RETRYABLE_METHODS.has(config.method?.toUpperCase() ?? "");
    const isNetworkFailure = !error.response;
    const isRetryableStatus = RETRYABLE_STATUS_CODES.includes(status) || isNetworkFailure;

    if (isNonMutating && isRetryableStatus && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      config.headers = {
        ...config.headers,
        "X-Eventra-Recovery-Attempt": String(config._retryCount),
      };
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      if (process.env.NODE_ENV === "development") {
        logger.info(
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${delay}ms...`
        );
      }
      await new Promise((r) => setTimeout(r, delay));
      return requestDeduplicator.execute(config, () => API(config));
    }

    const normalized = normalizeApiError(error);
    logCategorizedError(normalized, null, {
      type: "api",
      method: config.method?.toUpperCase(),
      url: config.url,
      status,
      retryCount,
    });
    throw normalized;
  };

  return { fulfill, reject };
};

const normalizeApiErrorWithTimeout = (error, timeoutMs) => {
  const config = error.config || {};
  const status = error?.response?.status;

  if (
    error.code === "ECONNABORTED" ||
    error.name === "AbortError" ||
    error.message?.includes("timeout")
  ) {
    return new ApiError(
      `Request timed out after ${timeoutMs / 1000}s: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isTimeout: true }
    );
  }

  if (!error.response) {
    return new ApiError(
      error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isNetworkError: true }
    );
  }

  if (status === 429) {
    return new RateLimitError(
      error.response?.data?.message || "Too many requests, please try again later.",
      { status, data: error.response?.data || null }
    );
  }

  return new ApiError(
    error.response?.data?.message || error.message || `Request failed with status ${status}`,
    { status, data: error.response?.data || null }
  );
};

export function setupRequestInterceptor(api, { isDev, buildApiUrl, getAuthToken }) {
  api.interceptors.request.use(async (config) => {
    assertReauthAllowsRequest(config);

    if (!globalCircuitBreaker.canExecute()) {
      throw new ApiError("Circuit breaker is OPEN. Requests blocked to protect service.", {
        status: 503,
        data: { code: "CIRCUIT_OPEN" },
      });
    }

    await clientRateLimiter.acquire();

    config._startTime = Date.now();
    config = await middlewarePipeline.runBefore(config);

    if (isDev) {
      logger.info(`[API ${config.method?.toUpperCase()}]`, buildApiUrl(config.url || ""));
    }

    const authToken = getAuthToken();
    if (authToken && authToken !== "cookie-managed") {
      config.headers["Authorization"] = `Bearer ${authToken}`;
    }

    const cached = apiCacheEngine.get(config);
    if (cached && !cached.isStale && !config.bypassCache) {
      config.adapter = async () => ({
        data: cached.data,
        status: cached.status,
        headers: { ...cached.headers, "x-from-cache": "true" },
        config,
      });
      return config;
    }

    if (cached?.etag) {
      config.headers["If-None-Match"] = cached.etag;
    }

    const method = config.method?.toUpperCase();
    if (requiresCSRF(method)) {
      const csrf = getCSRFToken();
      const enforcementMode = getCSRFEnforcementMode();

      if (!csrf) {
        if (enforcementMode === "strict") {
          logger.security("csrf_token_missing", {
            method,
            url: config.url || "unknown",
            enforcementMode,
          });
          throw new CSRFError(
            `CSRF token required for ${method} request. Please ensure the CSRF token is available in the meta tag or cookie.`,
            { status: 403 }
          );
        } else {
          logger.security("csrf_token_missing", {
            method,
            url: config.url || "unknown",
            enforcementMode,
          });
        }
      } else {
        config.headers["X-CSRF-Token"] = csrf;
      }

      if (!config.headers["Idempotency-Key"]) {
        config.headers["Idempotency-Key"] =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });
      }
    }

    return signRequestConfig(config);
  });
}

export function setupResponseInterceptor(
  api,
  {
    isDev,
    timeoutMs,
    getOnUnauthorized,
    getOnRequiresReauth,
    setAuthToken: applyAuthToken,
    setRefreshToken: applyRefreshToken,
  }
) {
  api.interceptors.response.use(
    async (response) => {
      const duration = Date.now() - (response.config._startTime || Date.now());
      apiTelemetryTracker.record(response.config, duration, true, response.status);
      globalCircuitBreaker.onSuccess();

      if (response.status === 304) {
        const cached = apiCacheEngine.get(response.config);
        if (cached) {
          response.data = cached.data;
          response.status = 200;
        }
      } else {
        apiCacheEngine.set(response.config, response, response.config.cacheOptions);
      }

      const headerValue =
        response.headers?.["x-server-time"] ||
        response.headers?.["date"] ||
        (typeof response.headers?.get === "function"
          ? response.headers.get("x-server-time") || response.headers.get("date")
          : null);

      if (headerValue) {
        syncServerTimeFromHeader(headerValue);
      }

      return middlewarePipeline.runAfter(response);
    },
    async (error) => {
      const config = error.config || {};
      const status = error?.response?.status;
      const errorCode = error?.response?.data?.code;
      const duration = Date.now() - (config._startTime || Date.now());

      apiTelemetryTracker.record(config, duration, false, status);
      globalCircuitBreaker.onFailure(status);
      await middlewarePipeline.runError(error);

      if (!error.response && typeof window !== "undefined" && !navigator.onLine) {
        offlineRequestQueue.enqueue(config);
      }

      const onUnauthorized = getOnUnauthorized();
      const onRequiresReauth = getOnRequiresReauth ? getOnRequiresReauth() : null;

      if (status === 401) {
        if (errorCode === "REQUIRES_REAUTH") {
          _reauthRequired = true;
          if (onRequiresReauth) onRequiresReauth();
          throw normalizeApiErrorWithTimeout(error, timeoutMs);
        }

        if (!config._retry && !config.url?.includes("/auth/refresh")) {
          config._retry = true;

          if (refreshTokenMutex.isRefreshing) {
            return new Promise((resolve, reject) => {
              refreshTokenMutex.subscribe((token) => {
                config.headers["Authorization"] = `Bearer ${token}`;
                resolve(api(config));
              }, reject);
            });
          }

          refreshTokenMutex.isRefreshing = true;

          try {
            if (!_refreshToken) {
              throw new Error("No refresh token available");
            }
            if (isDev) logger.info(`[API] Attempting token refresh...`);
            const refreshRes = await api.post("/auth/refresh", {
              refreshToken: _refreshToken,
            });
            const nextAccess = refreshRes?.data?.token;
            const nextRefresh = refreshRes?.data?.refreshToken;

            if (nextAccess) {
              if (applyAuthToken) applyAuthToken(nextAccess);
              else setAuthToken(nextAccess);
              config.headers = config.headers || {};
              config.headers["Authorization"] = `Bearer ${nextAccess}`;
            }
            if (nextRefresh) {
              if (applyRefreshToken) applyRefreshToken(nextRefresh);
              else setRefreshToken(nextRefresh);
            }

            refreshTokenMutex.processQueue(null, nextAccess);
            return api(config);
          } catch (refreshError) {
            logger.error("Token refresh failed. Locking user out.", refreshError);
            if (applyAuthToken) applyAuthToken(null);
            else setAuthToken(null);
            if (applyRefreshToken) applyRefreshToken(null);
            else setRefreshToken(null);

            refreshTokenMutex.processQueue(refreshError, null);

            if (onUnauthorized) {
              onUnauthorized();
            }
            throw normalizeApiErrorWithTimeout(refreshError, timeoutMs);
          } finally {
            refreshTokenMutex.isRefreshing = false;
          }
        }
        if (onUnauthorized) {
          onUnauthorized();
        }
      }

      const retryCount = config._retryCount || 0;
      const isNonMutating = RETRYABLE_METHODS.has(config.method?.toUpperCase() ?? "");
      const isNetworkFailure = !error.response;
      const isRetryableStatus = RETRYABLE_STATUS_CODES.includes(status) || isNetworkFailure;

      if (isNonMutating && isRetryableStatus && retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        config.headers = {
          ...config.headers,
          "X-Eventra-Recovery-Attempt": String(config._retryCount),
        };
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);

        if (isDev) {
          logger.info(
            `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${delay}ms (attempt ${config._retryCount})...`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        return requestDeduplicator.execute(config, () => api(config));
      }

      const normalized = normalizeApiErrorWithTimeout(error, timeoutMs);
      logCategorizedError(normalized, null, {
        type: "api",
        method: config.method?.toUpperCase(),
        url: config.url,
        status,
        retryCount,
      });
      throw normalized;
    }
  );
}