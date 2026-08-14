import { syncServerTimeFromHeader } from "../../utils/timeSync.js";
import { getCSRFToken, requiresCSRF, getCSRFEnforcementMode } from "../../utils/csrfToken.js";
import { signRequest } from "../../utils/requestSigner.js";
import { logger } from "../../utils/logger.js";
import { ApiError, RateLimitError, CSRFError, normalizeApiError } from "./errors.js";
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

export const createRequestInterceptor = (isDev) => async (config) => {
  assertReauthAllowsRequest(config);
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
  return signRequestConfig(config);
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
    const errorCode = error?.response?.data?.code;

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
      return API(config);
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

export function setupRequestInterceptor(api, { isDev, buildApiUrl, getAuthToken,   }) {
  api.interceptors.request.use(async (config) => {
    assertReauthAllowsRequest(config);
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

    return signRequestConfig(config);
  });
}

export function setupResponseInterceptor(api, { isDev, timeoutMs, getOnUnauthorized, getOnRequiresReauth, setAuthToken: applyAuthToken, setRefreshToken: applyRefreshToken }) {
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
      const errorCode = error?.response?.data?.code;

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
            return api(config);
          } catch (refreshError) {
            logger.error("Token refresh failed. Locking user out.", refreshError);
            if (applyAuthToken) applyAuthToken(null);
            else setAuthToken(null);
            if (applyRefreshToken) applyRefreshToken(null);
            else setRefreshToken(null);
            if (onUnauthorized) {
              onUnauthorized();
            }
            throw normalizeApiErrorWithTimeout(refreshError, timeoutMs);
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
            `[API ${config.method?.toUpperCase()}] ${config.url} returned ${status}, retrying in ${delay}ms (attempt ${config._retryCount})...`,
          );
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
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
    },
  );
}
