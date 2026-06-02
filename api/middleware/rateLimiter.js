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
  const store = new Map();

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
      const existing = store.get(ip);
      const bucket =
        existing && existing.resetAt > now
          ? { count: existing.count + 1, resetAt: existing.resetAt }
          : { count: 1, resetAt: now + windowMs };
      const bucket = existing && existing.resetAt > now
        ? { count: existing.count + 1, resetAt: existing.resetAt }
        : { count: 1, resetAt: now + windowMs };

      store.set(ip, bucket);

      const remaining = Math.max(max - bucket.count, 0);
      const setHeader = resolveHeaderSetter(res);
      setHeader("RateLimit-Limit", String(max));
      setHeader("RateLimit-Remaining", String(remaining));
      setHeader("RateLimit-Reset", String(Math.ceil((bucket.resetAt - now) / 1000)));

      if (bucket.count > max) {
        const body = {
          success: false,
          message,
          error: message,
        };
        return res.status(429).json(body);
      }

      return handler(req, res);
    };
  };
};
