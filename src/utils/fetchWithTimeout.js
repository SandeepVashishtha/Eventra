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
    } else {
      options.signal.addEventListener("abort", handleUserAbort);
    }
  }
  const method = (options.method || "GET").toUpperCase();
  let requestHeaders = options.headers;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Idempotency-Key")) {
      // Fix (Issue #9230): Use crypto.getRandomValues() instead of Math.random()
      // Math.random() is not cryptographically secure — values are predictable.
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
      signal: controller.signal, // This now responds to BOTH the timeout and the user's unmount signal
    });

    // Read the body once — directly from the response stream.
    //
    // The previous implementation used response.clone().json() which allocates
    // a duplicate of the entire body in memory before parsing, doubling peak
    // consumption for every request. Since callers consume the returned `data`
    // field rather than response.body, there is no need to keep the original
    // stream open. Read directly and skip the clone.
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
    if (error instanceof FetchError) {
      // Already a FetchError (thrown by the !response.ok block above) — rethrow as-is
      throw error;
    }

    if (error.name === "AbortError") {
      logger.error("[fetchWithTimeout] Request aborted or timed out:", url);
      throw new FetchError(
        `Request timed out after ${timeout}ms or was manually aborted`
      );
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
