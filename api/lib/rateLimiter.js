export const createRateLimiter = (windowMs, maxRequests) => {
  const store = new Map();
  const check = (key) => {
    const now = Date.now();
    const record = store.get(key);
    if (!record || now - record.start > windowMs) {
      store.set(key, { start: now, count: 1 });
      return { allowed: true };
    }
    record.count++;
    return { allowed: record.count <= maxRequests };
  };
  return { check };
};

export const loginRateLimiter = createRateLimiter(60_000, 10);

export const enforceRateLimit = (limiter, key) => {
  const result = limiter.check(key);
  if (!result.allowed) {
    const err = new Error("Too many requests. Please try again later.");
    err.status = 429;
    throw err;
  }
};
