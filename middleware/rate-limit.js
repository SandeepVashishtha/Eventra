import { incrementWithExpiration } from "../api/_lib/rate-limit-storage.js";
import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "../api/_lib/rate-limit-config.js";

const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

const isRateLimited = async (ip) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isDistributedConfigured = isDistributedRateLimitStorageConfigured();
  const isInMemoryAllowed = isInMemoryRateLimitStorageAllowed();

  // Production: Fail closed - reject requests if distributed storage is not configured
  if (isProduction && !isDistributedConfigured) {
    console.error(
      "[SECURITY] Rate limiting unavailable: RATE_LIMIT_REDIS_URL is required in production. Rejecting request."
    );
    return true; // Rate limit (reject) in production when storage is unavailable
  }

  // Development/Test: Use in-memory fallback if distributed storage is not configured
  if (!isDistributedConfigured) {
    if (isInMemoryAllowed) {
      console.warn(
        "[DEV] Rate limiting using in-memory fallback (distributed storage not configured)"
      );
    }
    // Note: incrementWithExpiration handles the in-memory fallback internally
  }

  // Use shared storage layer (Redis or in-memory fallback)
  try {
    const key = `rl:${ip}`;
    const windowMs = API_RATE_WINDOW_S * 1000;
    const { count } = await incrementWithExpiration(key, windowMs);
    return count > API_RATE_LIMIT;
  } catch (error) {
    // Production: Fail closed on storage errors
    if (isProduction) {
      console.error(
        "[SECURITY] Rate limiting unavailable: Storage operation failed.",
        error.message
      );
      return true; // Rate limit (reject) in production on errors
    }
    // Development: incrementWithExpiration already falls back to in-memory on errors
    console.warn(
      "[DEV] Rate limiting storage error. Using in-memory fallback.",
      error.message
    );
    // Try in-memory fallback directly
    try {
      const key = `rl:${ip}`;
      const windowMs = API_RATE_WINDOW_S * 1000;
      const { count } = await incrementWithExpiration(key, windowMs);
      return count > API_RATE_LIMIT;
    } catch (fallbackError) {
      console.error(
        "[SECURITY] Rate limiting unavailable: Both distributed and in-memory storage failed.",
        fallbackError.message
      );
      return true; // Rate limit (reject) if everything fails
    }
  }
};

export async function checkRateLimit(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (await isRateLimited(ip)) {
    return { limited: true, ip, window: API_RATE_WINDOW_S };
  }
  return { limited: false, ip };
}
