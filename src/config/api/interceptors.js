import { logger } from "../../utils/logger.js";
import { getCSRFToken } from "../../utils/csrfToken.js";
import { syncServerTimeFromHeader } from "../../utils/timeSync.js";
import { normalizeApiError } from "./errors.js";

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
    const headerValue = response.headers.get("x-server-time") || response.headers.get("date");
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
