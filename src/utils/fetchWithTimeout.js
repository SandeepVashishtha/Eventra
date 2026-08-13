import { logger } from "./logger.js";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 0;
const DEFAULT_RETRY_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

// ============================================================================
// 2. CUSTOM ERROR CLASSES
// ============================================================================

export class FetchError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}

export class TimeoutError extends FetchError {
  constructor(message = "Request timed out", timeoutMs = DEFAULT_TIMEOUT_MS) {
    super(message, 408, null);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export class NetworkError extends FetchError {
  constructor(message = "Network connection failure") {
    super(message, 0, null);
    this.name = "NetworkError";
  }
}

// ============================================================================
// 3. INTERCEPTOR PIPELINES
// ============================================================================

const requestInterceptors = [];
const responseInterceptors = [];

export const registerRequestInterceptor = (interceptor) => {
  if (typeof interceptor === "function") {
    requestInterceptors.push(interceptor);
  }
};

export const registerResponseInterceptor = (interceptor) => {
  if (typeof interceptor === "function") {
    responseInterceptors.push(interceptor);
  }
};

// ============================================================================
// 4. HELPER UTILITIES
// ============================================================================

/**
 * Safely parses response body based on Content-Type and status code
 */
const parseResponseBody = async (response) => {
  // HTTP 204 No Content or 205 Reset Content have no body
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json") || contentType.includes("/json")) {
      return await response.json();
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (parseErr) {
    logger.warn("[fetchUtils] Failed to parse response payload:", parseErr);
    return null;
  }
};

/**
 * Delay execution for retries with exponential backoff and jitter
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateBackoff = (attempt, baseDelayMs, response = null) => {
  // Respect server Retry-After header if present
  if (response && response.headers) {
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
      const seconds = parseInt(retryAfter, 10);
      if (!isNaN(seconds)) return seconds * 1000;
    }
  }

  // Exponential backoff + jitter
  const backoff = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return backoff + jitter;
};

// ============================================================================
// 5. CORE FETCH ENGINE
// ============================================================================

/**
 * Enhanced fetch client with timeout, user signal forwarding, retries, and Interceptors.
 *
 * @param {string} url - Target URL
 * @param {object} [options={}] - Standard RequestInit options + retry extensions
 * @param {number} [timeout=DEFAULT_TIMEOUT_MS] - Timeout limit in milliseconds
 * @returns {Promise<{response: Response, data: any}>}
 */
export const fetchWithTimeout = async (
  url,
  options = {},
  timeout = DEFAULT_TIMEOUT_MS
) => {
  const {
    retries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    retryOn = RETRYABLE_STATUS_CODES,
    headers = {},
    signal: userSignal,
    ...fetchOptions
  } = options;

  let attempt = 0;

  while (attempt <= retries) {
    const controller = new AbortController();
    let isTimeoutTriggered = false;

    // Timer setup for timeout
    const timeoutId = setTimeout(() => {
      isTimeoutTriggered = true;
      controller.abort();
    }, timeout);

    // Link user signal if provided
    const handleUserAbort = () => {
      controller.abort();
    };

    if (userSignal) {
      if (userSignal.aborted) {
        controller.abort();
      } else {
        userSignal.addEventListener("abort", handleUserAbort);
      }
    }

    // Apply request interceptors
    let finalOptions = {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      signal: controller.signal,
    };

    for (const interceptor of requestInterceptors) {
      try {
        finalOptions = (await interceptor(url, finalOptions)) || finalOptions;
      } catch (err) {
        logger.error("[fetchUtils] Request interceptor error:", err);
      }
    }

    try {
      const response = await fetch(url, finalOptions);

      // Parse payload safely
      let data = await parseResponseBody(response);

      // Apply response interceptors
      for (const interceptor of responseInterceptors) {
        try {
          data = (await interceptor(response, data)) || data;
        } catch (err) {
          logger.error("[fetchUtils] Response interceptor error:", err);
        }
      }

      // Check HTTP success status
      if (!response.ok) {
        const errorData = data;
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          `Request failed with status ${response.status}`;

        // Determine if we should retry
        if (
          attempt < retries &&
          (retryOn.has ? retryOn.has(response.status) : retryOn.includes(response.status))
        ) {
          attempt++;
          const delay = calculateBackoff(attempt - 1, retryDelay, response);
          logger.warn(
            `[fetchUtils] Retrying request (${attempt}/${retries}) to ${url} after ${Math.round(delay)}ms...`
          );
          await sleep(delay);
          continue;
        }

        throw new FetchError(errorMessage, response.status, errorData);
      }

      return { response, data };
    } catch (error) {
      // Handle Aborts & Timeouts
      if (error.name === "AbortError" || controller.signal.aborted) {
        if (isTimeoutTriggered) {
          logger.error(`[fetchUtils] Request timed out after ${timeout}ms:`, url);
          throw new TimeoutError(`Request timed out after ${timeout}ms`, timeout);
        }

        // User manual cancellation
        if (userSignal?.aborted) {
          logger.info("[fetchUtils] Request manually aborted by caller:", url);
          throw new FetchError("Request was cancelled by user caller");
        }
      }

      // Handle network errors retry
      if (
        attempt < retries &&
        !(error instanceof FetchError) &&
        !userSignal?.aborted
      ) {
        attempt++;
        const delay = calculateBackoff(attempt - 1, retryDelay);
        logger.warn(
          `[fetchUtils] Network error. Retrying (${attempt}/${retries}) to ${url}...`
        );
        await sleep(delay);
        continue;
      }

      if (error instanceof FetchError) {
        throw error;
      }

      logger.error("[fetchUtils] Network or execution failure:", error);
      throw new NetworkError(error.message || "Failed to execute fetch request");
    } finally {
      clearTimeout(timeoutId);
      if (userSignal) {
        userSignal.removeEventListener("abort", handleUserAbort);
      }
    }
  }
};

// ============================================================================
// 6. API CLIENT CONVENIENCE WRAPPERS
// ============================================================================

export const apiClient = {
  get: (url, options = {}, timeout) =>
    fetchWithTimeout(url, { ...options, method: "GET" }, timeout),

  post: (url, body, options = {}, timeout) =>
    fetchWithTimeout(
      url,
      {
        ...options,
        method: "POST",
        body: typeof body === "object" ? JSON.stringify(body) : body,
      },
      timeout
    ),

  put: (url, body, options = {}, timeout) =>
    fetchWithTimeout(
      url,
      {
        ...options,
        method: "PUT",
        body: typeof body === "object" ? JSON.stringify(body) : body,
      },
      timeout
    ),

  patch: (url, body, options = {}, timeout) =>
    fetchWithTimeout(
      url,
      {
        ...options,
        method: "PATCH",
        body: typeof body === "object" ? JSON.stringify(body) : body,
      },
      timeout
    ),

  delete: (url, options = {}, timeout) =>
    fetchWithTimeout(url, { ...options, method: "DELETE" }, timeout),
};
