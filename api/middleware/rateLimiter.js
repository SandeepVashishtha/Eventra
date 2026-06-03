const DEFAULT_LIMIT_MESSAGE = "Too many authentication attempts. Please try again later.";

const resolveHeaderSetter = (res) => {
  if (typeof res.setHeader === "function") {
    return (key, value) => res.setHeader(key, value);
  }

  if (typeof res.set === "function") {
    return (key, value) => res.set({ [key]: value });
  }

  if (res.headers && typeof res.headers === "object") {
    return (key, value) => {
      res.headers[key] = value;
    };
  }

  return () => {};
};

const getRequestIp = (req) => {
  const headers = req.headers || {};
  const forwarded = headers["x-forwarded-for"] || headers["x-real-ip"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (req.ip) {
    return req.ip;
  }

  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }

  if (req.connection?.remoteAddress) {
    return req.connection.remoteAddress;
  }

  return null;
};

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 5,
  message = DEFAULT_LIMIT_MESSAGE,
} = {}) => {
  // Sliding window: stores an array of timestamps per key.
  // On each request, expired entries are filtered out, then the remaining
  // count is compared against the limit. This eliminates the boundary burst
  // issue inherent to fixed-window (where 2*max requests could pass in
  // consecutive windows around the boundary).
  const store = new Map();

  // Periodic cleanup to prevent memory leaks from stale keys
  let lastCleanupAt = 0;
  const evictStale = () => {
    const now = Date.now();
    if (now - lastCleanupAt < windowMs) return;
    lastCleanupAt = now;
    const cutoff = now - windowMs;
    for (const [key, timestamps] of store.entries()) {
      const valid = timestamps.filter((t) => t > cutoff);
      if (valid.length === 0) {
        store.delete(key);
      } else {
        store.set(key, valid);
      }
    }
  };

  return (handler) => {
    return async (req, res) => {
      if (req.method === "OPTIONS") {
        return handler(req, res);
      }

      const ip = getRequestIp(req);
      if (!ip) {
        return handler(req, res);
      }

      const now = Date.now();
      const cutoff = now - windowMs;
      const existing = store.get(ip) || [];
      const validTimestamps = existing.filter((t) => t > cutoff);

      if (validTimestamps.length >= max) {
        evictStale();
        const resetEpoch = Math.ceil((validTimestamps[0] + windowMs) / 1000);
        const remaining = 0;
        const setHeader = resolveHeaderSetter(res);
        setHeader("RateLimit-Limit", String(max));
        setHeader("RateLimit-Remaining", String(remaining));
        setHeader("RateLimit-Reset", String(resetEpoch));
        return res.status(429).json({
          success: false,
          message,
          error: message,
        });
      }

      validTimestamps.push(now);
      store.set(ip, validTimestamps);

      const remaining = max - validTimestamps.length;
      const resetEpoch = Math.ceil((validTimestamps[0] + windowMs) / 1000);
      const setHeader = resolveHeaderSetter(res);
      setHeader("RateLimit-Limit", String(max));
      setHeader("RateLimit-Remaining", String(remaining));
      setHeader("RateLimit-Reset", String(resetEpoch));

      return handler(req, res);
    };
  };
};
