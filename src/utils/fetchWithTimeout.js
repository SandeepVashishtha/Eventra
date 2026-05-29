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

  // 🔥 FIX: Link the user's custom abort signal to our internal controller.
  const handleUserAbort = () => controller.abort();

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener("abort", handleUserAbort);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal, // This now responds to BOTH the timeout and the user's unmount signal
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
      logger.error("[fetchWithTimeout] Request aborted or timed out:", url);

      throw new FetchError(
        `Request timed out after ${timeout}ms or was manually aborted`
      );
    }

    logger.error("[fetchWithTimeout] Request failed:", error);

    throw error;
  } finally {
    clearTimeout(timeoutId);
    // 🔥 FIX: Always clean up the event listener to prevent memory leaks
    if (options.signal) {
      options.signal.removeEventListener("abort", handleUserAbort);
    }
  }
};