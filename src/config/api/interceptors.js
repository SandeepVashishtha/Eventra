import { syncServerTimeFromHeader } from "../../utils/timeSync.js";
import { getCSRFToken, requiresCSRF } from "../../utils/csrfToken.js";
import { logger } from "../../utils/logger.js";
import { ApiError, RateLimitError, CSRFError } from "./errors.js";

const RETRYABLE_STATUS_CODES = [502, 503, 504];
const RETRYABLE_METHODS = new Set(["GET", "HEAD", "OPTIONS", "TRACE"]);
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 1_000;

let onUnauthorized = null;
let _authToken = null;

export const setOnUnauthorizedHandler = (handler) => { onUnauthorized = handler; };
export const setAuthToken = (token) => { _authToken = token; };

export const createRequestInterceptor = (isDev) => (config) => {
  if (isDev) {
    logger.info(`[API ${config.method?.toUpperCase()}]`, config.url || "");
  }

  if (_authToken && _authToken !== "cookie-managed") {
    config.headers["Authorization"] = `Bearer ${_authToken}`;
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
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
    }
  }
  return config;
};

export const createResponseInterceptor = (API) => {
  const fulfill = (response) => {
    const headerValue = response.headers?.["x-server-time"] || response.headers?.["date"] || (typeof response.headers?.get === 'function' ? (response.headers.get("x-server-time") || response.headers.get("date")) : null);
    if (headerValue) syncServerTimeFromHeader(headerValue);
    return response;
  };

  const reject = async (error) => {
    const config = error.config || {};
    const status = error?.response?.status;

    if (status === 401 && onUnauthorized) onUnauthorized();

    const retryCount = config._retryCount || 0;
    const isNonMutating = RETRYABLE_METHODS.has(config.method?.toUpperCase() ?? "");
    const isRetryableStatus = RETRYABLE_STATUS_CODES.includes(status);

    if (isNonMutating && isRetryableStatus && retryCount < MAX_RETRIES) {
      config._retryCount = retryCount + 1;
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      if (process.env.NODE_ENV === "development") {
        logger.info(
          `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${delay}ms...`
        );
      }
      await new Promise((r) => setTimeout(r, delay));
      return API(config);
    }
    throw normalizeApiError(error);
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
      { status, isTimeout: true },
    );
  }

  if (!error.response) {
    return new ApiError(
      error.message || `Network error: ${config.method?.toUpperCase()} ${config.url}`,
      { status, isNetworkError: true },
    );
  }

  if (status === 429) {
    return new RateLimitError(
      error.response?.data?.message || "Too many requests, please try again later.",
      { status, data: error.response?.data || null },
    );
  }

  return new ApiError(
    error.response?.data?.message || error.message || `Request failed with status ${status}`,
    { status, data: error.response?.data || null },
  );
};

const getCSRFEnforcementMode = () => {
  if (typeof import.meta.env !== "undefined" && import.meta.env.VITE_CSRF_ENFORCEMENT_MODE) {
    return import.meta.env.VITE_CSRF_ENFORCEMENT_MODE;
  }
  if (typeof process !== "undefined" && process.env?.VITE_CSRF_ENFORCEMENT_MODE) {
    return process.env.VITE_CSRF_ENFORCEMENT_MODE;
  }
  return "warning";
};

export function setupRequestInterceptor(api, { isDev, buildApiUrl, getAuthToken, getOnUnauthorized }) {
  api.interceptors.request.use((config) => {
    if (isDev) {
      logger.info(`[API ${config.method?.toUpperCase()}]`, buildApiUrl(config.url || ""));
    }

    const authToken = getAuthToken();
    if (authToken && authToken !== "cookie-managed") {
      config.headers["Authorization"] = `Bearer ${authToken}`;
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
            { status: 403 },
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
        config.headers["Idempotency-Key"] = typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              const v = c === "x" ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
      }
    }

    return config;
  });
}

export function setupResponseInterceptor(api, { isDev, timeoutMs, getOnUnauthorized }) {
  api.interceptors.response.use(
    (response) => {
      const headerValue = response.headers?.["x-server-time"] || response.headers?.["date"] || (typeof response.headers?.get === 'function' ? (response.headers.get("x-server-time") || response.headers.get("date")) : null);
      if (headerValue) {
        syncServerTimeFromHeader(headerValue);
      }
      return response;
    },
    async (error) => {
      const config = error.config || {};
      const status = error?.response?.status;

      const onUnauthorized = getOnUnauthorized();
      if (status === 401 && onUnauthorized) {
        onUnauthorized();
      }

      const retryCount = config._retryCount || 0;
      const isNonMutating = RETRYABLE_METHODS.has(config.method?.toUpperCase() ?? "");
      const isRetryableStatus = RETRYABLE_STATUS_CODES.includes(status);

      if (isNonMutating && isRetryableStatus && retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);

        if (isDev) {
          logger.info(
            `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${delay}ms (attempt ${config._retryCount})...`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
      throw normalizeApiErrorWithTimeout(error, timeoutMs);
    },
  );
}
