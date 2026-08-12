import { logger } from "./logger.js";

const DEFAULT_TIMEOUT = 10000;

export class FetchError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}

// ---------------------------------------------------------------------------
// FIX (#13609): Token Refresh Queue / Subscriber Pattern for 401 Mutex Locks
// ---------------------------------------------------------------------------
let isRefreshingToken = false;
let refreshTokenSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshTokenSubscribers.push(callback);
};

const onRefreshedToken = (newToken) => {
  refreshTokenSubscribers.forEach((cb) => cb(newToken));
  refreshTokenSubscribers = [];
};

export const setRefreshingState = (state) => {
  isRefreshingToken = state;
};

export const fetchWithTimeout = async (
  url,
  options = {},
  timeout = DEFAULT_TIMEOUT
) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const handleUserAbort = () => controller.abort();

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
      throw new DOMException("Aborted", "AbortError");
    } else {
      options.signal.addEventListener("abort", handleUserAbort);
    }
  }

  // If a refresh is currently in progress, wait in queue before proceeding
  if (isRefreshingToken && !url.includes("/auth/refresh")) {
    await new Promise((resolve) => {
      subscribeTokenRefresh((newToken) => {
        if (options.headers && typeof options.headers.set === "function") {
          options.headers.set("Authorization", `Bearer ${newToken}`);
        }
        resolve();
      });
    });
  }

  const method = (options.method || "GET").toUpperCase();
  let requestHeaders = options.headers;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Idempotency-Key")) {
      let idempotencyKey;
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        idempotencyKey = crypto.randomUUID();
      } else if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        idempotencyKey = [...bytes].map((b, i) =>
          [4, 6, 8, 10].includes(i)
            ? '-' + b.toString(16).padStart(2, '0')
            : b.toString(16).padStart(2, '0')
        ).join('');
      } else {
        throw new Error("[fetchWithTimeout] crypto API unavailable — cannot generate secure Idempotency-Key");
      }
      headers.set("Idempotency-Key", idempotencyKey);
    }
    requestHeaders = headers;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json") || contentType.includes("/json")) {
        data = await response.json();
      } else {
        const text = await response.text().catch(() => null);
        if (typeof text === "string") {
          try { data = JSON.parse(text); } catch { data = text; }
        }
      }
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new FetchError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data,
      );
    }

    return {
      response,
      data,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof FetchError) {
      throw error;
    }

    if (error.name === "AbortError") {
      logger.error("[fetchWithTimeout] Request aborted or timed out:", url);
      throw new FetchError(
        `Request timed out after ${timeout}ms or was manually aborted`
      );
    }

    logger.error("[fetchWithTimeout] Request failed:", error);
    throw new FetchError(error.message || "Network request failed");
  }
};
