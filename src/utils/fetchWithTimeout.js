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

  try {
    // 🔥 FIX: Combine the user's signal (if provided) with our internal timeout signal.
    // This ensures component unmounts can still cancel the request!
    const combinedSignal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal;

    const response = await fetch(url, {
      ...options,
      signal: combinedSignal,
    });

    let data = null;

    try {
      data = await response.clone().json();
    } catch {
      data = await response.text().catch(() => null);
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
    if (error.name === "AbortError") {
      // Check if it was our timeout that caused the abort, or the user's custom signal
      if (controller.signal.aborted) {
        logger.error("[fetchWithTimeout] Request timeout:", url);
        throw new FetchError(`Request timed out after ${timeout}ms`);
      } else {
        logger.log("[fetchWithTimeout] Request aborted by user/component:", url);
        throw error;
      }
    }

    logger.error("[fetchWithTimeout] Request failed:", error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};