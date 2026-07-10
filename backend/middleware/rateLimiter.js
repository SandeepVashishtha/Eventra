import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Server-side rate limiting is required because frontend-only controls can be
// bypassed by clearing storage, switching browsers, or sending requests with
// tools such as curl or Postman. An IP-based middleware enforces a shared
// throttle at the API boundary, which protects sensitive routes regardless of
// the client implementation.

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 5;

function buildLimiter({
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX_REQUESTS,
  message = 'Too many requests. Please try again later.',
  standardHeaders = true,
  legacyHeaders = false,
  keyGenerator = (req) => ipKeyGenerator(req.ip),
  skip = () => false,
  store,
} = {}) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders,
    legacyHeaders,
    keyGenerator,
    skip,
    store,
    handler: (req, res) => {
      res.status(429).set('Retry-After', String(Math.ceil(windowMs / 1000))).json({
        success: false,
        message,
      });
    },
  });
}

export const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many requests. Please try again later.',
});

export const registerLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many requests. Please try again later.',
});

export const reservationLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many requests. Please try again later.',
});

export const productLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many requests. Please try again later.',
});

export const generalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again later.',
});

export function attachRateLimiters(app) {
  if (!app || typeof app.use !== 'function') {
    throw new TypeError('attachRateLimiters expects an Express app instance');
  }

  // Trust the first proxy hop so req.ip reflects the real client IP when the
  // application is deployed behind a load balancer or reverse proxy.
  app.set('trust proxy', 1);

  return app;
}
