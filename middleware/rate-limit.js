import {
  isDistributedRateLimitStorageConfigured,
  isInMemoryRateLimitStorageAllowed,
} from "../api/_lib/rate-limit-config.js";

const API_RATE_LIMIT = 60;
const API_RATE_WINDOW_S = 60;

// In-memory fallback for development/testing (shared across requests)
// Exported for test cleanup
export const inMemoryRateLimitStore = new Map();

const isRateLimited = async (ip) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  const isProduction = process.env.NODE_ENV === "production";

  // Check if distributed storage is configured
  const isDistributedConfigured = isDistributedRateLimitStorageConfigured();
  const isInMemoryAllowed = isInMemoryRateLimitStorageAllowed();

  // Production: Fail closed - reject requests if distributed storage is not configured
  if (isProduction && !isDistributedConfigured) {
    console.error(
      "[SECURITY] Rate limiting unavailable: KV_REST_API_URL and KV_REST_API_TOKEN are required in production. Rejecting request."
    );
    return true; // Rate limit (reject) in production when storage is unavailable
  }

  // Development/Test: Use in-memory fallback if distributed storage is not configured
  if (!isDistributedConfigured) {
    if (isInMemoryAllowed) {
      console.warn(
        "[DEV] Rate limiting using in-memory fallback (distributed storage not configured)"
      );
      return checkInMemoryRateLimit(ip);
    } else {
      // Should not happen, but fail closed if somehow in non-production but in-memory not allowed
      console.error(
        "[SECURITY] Rate limiting unavailable: Distributed storage not configured and in-memory fallback not permitted. Rejecting request."
      );
      return true; // Rate limit (reject)
    }
  }

  // Distributed storage is configured - use KV
  try {
    const key = `rl:${ip}`;
    const headers = {
      Authorization: `Bearer ${kvToken}`,
      "Content-Type": "application/json",
    };

    const incrRes = await fetch(`${kvUrl}/incr/${key}`, {
      method: "POST",
      headers,
    });

    if (!incrRes.ok) {
      // Production: Fail closed on KV request failure
      if (isProduction) {
        console.error(
          `[SECURITY] Rate limiting unavailable: KV request failed with status ${incrRes.status}. Rejecting request.`
        );
        return true; // Rate limit (reject) in production when KV fails
      }
      // Development: Fall back to in-memory on KV failure
      console.warn(
        `[DEV] KV request failed with status ${incrRes.status}. Falling back to in-memory rate limiting.`
      );
      return checkInMemoryRateLimit(ip);
    }

    const { result: count } = await incrRes.json();

    if (count === 1) {
      await fetch(`${kvUrl}/expire/${key}/${API_RATE_WINDOW_S}`, {
        method: "POST",
        headers,
      });
    }

    return count > API_RATE_LIMIT;
  } catch (error) {
    // Production: Fail closed on network errors or invalid responses
    if (isProduction) {
      console.error(
        "[SECURITY] Rate limiting unavailable: KV communication error.",
        error.message
      );
      return true; // Rate limit (reject) in production on errors
    }
    // Development: Fall back to in-memory on errors
    console.warn(
      "[DEV] KV communication error. Falling back to in-memory rate limiting.",
      error.message
    );
    return checkInMemoryRateLimit(ip);
  }
};

// In-memory rate limit check for development/testing
const checkInMemoryRateLimit = (ip) => {
  const key = `rl:${ip}`;
  const now = Date.now();
  const entry = inMemoryRateLimitStore.get(key);

  // Reset if window expired
  if (!entry || now - entry.timestamp > API_RATE_WINDOW_S * 1000) {
    inMemoryRateLimitStore.set(key, { count: 1, timestamp: now });
    return false; // Not rate limited
  }

  entry.count++;
  inMemoryRateLimitStore.set(key, entry);

  return entry.count > API_RATE_LIMIT;
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
