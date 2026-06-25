import { logger } from "./logger";

const DEFAULT_TIMEOUT = 10000;

export class FetchError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.data = data;
  }
}

export const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const handleUserAbort = () => controller.abort();

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", handleUserAbort);
    }
  }

  const method = (options.method || "GET").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Idempotency-Key")) {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0;
              const v = c === "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });
      headers.set("Idempotency-Key", idempotencyKey);
    }
    options.headers = headers;
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    let data = null;
    const contentType = response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json") || contentType.includes("/json")) {
        data = await response.json();
      } else {
        const text = await response.text().catch(() => null);
        if (typeof text === "string") {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      }
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new FetchError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return {
      response,
      data,
    };
  } catch (error) {
    if (error instanceof FetchError) {
      // Already a FetchError (thrown by the !response.ok block above) — rethrow as-is
      throw error;
    }

    if (error.name === "AbortError") {
      logger.error("[fetchWithTimeout] Request aborted or timed out:", url);
      throw new FetchError(`Request timed out after ${timeout}ms or was manually aborted`);
    }

    // Network-level failure (e.g. TypeError: Failed to fetch) — wrap in FetchError
    // so all callers can rely on a single consistent error type
    logger.error("[fetchWithTimeout] Request failed:", error);
    throw new FetchError(error.message || "Network request failed");
  } finally {
    clearTimeout(timeoutId);
    if (options.signal) {
      options.signal.removeEventListener("abort", handleUserAbort);
    }
  }
};
