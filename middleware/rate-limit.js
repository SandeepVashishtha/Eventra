import { incrementWithExpiration } from "../api/_lib/rate-limit-storage.js";
import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
  getRateLimitFailMode,
} from "../api/_lib/rate-limit-config.js";
import { getClientIp } from "../api/_lib/getClientIp.js";

const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

const isRateLimited = async (ip) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isDistributedConfigured = isDistributedRateLimitStorageConfigured();
  const isInMemoryAllowed = isInMemoryRateLimitStorageAllowed();
  const failMode = getRateLimitFailMode();

  // Check fail-closed mode: reject if distributed storage is not configured
  if (isProduction && !isDistributedConfigured && failMode === "closed") {
    console.error(
      "[RATE_LIMIT] Distributed storage not configured in production (fail-closed mode). Rejecting request."
    );
    return true; // Rate limit (reject) in fail-closed mode when storage is unavailable
  }

  // Log when using in-memory fallback
  if (!isDistributedConfigured) {
    if (isInMemoryAllowed || failMode !== "closed") {
      console.warn(
        "[RATE_LIMIT] Distributed storage not configured. Using in-memory fallback."
      );
    }
  }

  // Try distributed storage first, then fall back to in-memory if needed
  try {
    const key = `rl:${ip}`;
    const windowMs = API_RATE_WINDOW_S * 1000;
    const { count } = await incrementWithExpiration(key, windowMs);
    return count > API_RATE_LIMIT;
  } catch (error) {
    // Handle storage failure based on fail mode
    console.error("[RATE_LIMIT] Distributed storage operation failed:", error.message);

    // In development/test, always allow with in-memory fallback regardless of fail mode
    if (!isProduction) {
      console.warn("[RATE_LIMIT] Development environment: Using in-memory fallback");
      try {
        const key = `rl:${ip}`;
        const windowMs = API_RATE_WINDOW_S * 1000;
        const { count } = await incrementWithExpiration(key, windowMs, {
          forceInMemoryFallback: true,
        });
        return count > API_RATE_LIMIT;
      } catch (fallbackError) {
        console.error(
          "[RATE_LIMIT] In-memory fallback failed in development. Allowing request.",
          fallbackError.message
        );
        return false; // Allow request in development
      }
    }

    if (failMode === "closed") {
      // Fail-closed: reject all requests when storage fails (production only)
      console.error(
        "[RATE_LIMIT] Storage unavailable in fail-closed mode. Rejecting request."
      );
      return true;
    }

    if (failMode === "open") {
      // Fail-open: allow all requests when storage fails
      console.warn(
        "[RATE_LIMIT] Storage unavailable in fail-open mode. Allowing request without rate limiting."
      );
      return false; // Allow request
    }

    // Fallback mode (default): try in-memory, then allow if that fails
    console.warn("[RATE_LIMIT] Attempting in-memory fallback...");
    try {
      const key = `rl:${ip}`;
      const windowMs = API_RATE_WINDOW_S * 1000;
      const { count } = await incrementWithExpiration(key, windowMs, {
        forceInMemoryFallback: true,
      });
      return count > API_RATE_LIMIT;
    } catch (fallbackError) {
      // Degraded mode: both distributed and in-memory failed
      console.error(
        "[RATE_LIMIT] CRITICAL: Both distributed and in-memory storage failed. Entering degraded mode (allowing requests).",
        fallbackError.message
      );
      return false; // Allow request in degraded mode
    }
  }
};

export async function checkRateLimit(request) {
  // Use secure getClientIp function with trusted proxy validation
  const ip = getClientIp(request);

  if (await isRateLimited(ip)) {
    return { limited: true, ip, window: API_RATE_WINDOW_S };
  }
  return { limited: false, ip };
}
