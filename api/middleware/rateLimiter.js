import crypto from "crypto";

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // default requests per window per user
const COOKIE_NAME = "eventra-rl";
const COOKIE_SECRET = process.env.JWT_SECRET || "eventra-rate-limiter-fallback-secret-key-123456";

// Helpers to sign and verify
function sign(data) {
  return crypto.createHmac("sha256", COOKIE_SECRET).update(data).digest("hex");
}

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach(cookie => {
    const parts = cookie.split("=");
    list[parts.shift().trim()] = decodeURI(parts.join("="));
  });
  return list;
}

export function rateLimiter(maxRequests = RATE_LIMIT_MAX_REQUESTS) {
  return (handler) => {
    return async (req, res) => {
      // req.user is set by verifyAuth middleware
      const userId = req.user?.id || req.user?.email || "anonymous";
      const now = Date.now();
      const cookies = parseCookies(req.headers.cookie);
      const rlCookie = cookies[COOKIE_NAME];

      let windowStart = now;
      let count = 0;
      let isValid = false;

      if (rlCookie) {
        const parts = rlCookie.split(":");
        if (parts.length === 3) {
          const [cTimestamp, cCount, cSig] = parts;
          // Verify signature
          const expectedSig = sign(`${userId}:${cTimestamp}:${cCount}`);
          if (cSig === expectedSig) {
            windowStart = parseInt(cTimestamp, 10);
            count = parseInt(cCount, 10);
            isValid = true;
          }
        }
      }

      if (isValid && (now - windowStart < RATE_LIMIT_WINDOW_MS)) {
        if (count >= maxRequests) {
          return res.status(429).json({
            error: "Too many requests. Please wait before sending more requests."
          });
        }
        count += 1;
      } else {
        windowStart = now;
        count = 1;
      }

      // Create new cookie signature
      const newSig = sign(`${userId}:${windowStart}:${count}`);
      const cookieValue = `${windowStart}:${count}:${newSig}`;

      // Set cookie in response header
      const expires = new Date(windowStart + RATE_LIMIT_WINDOW_MS).toUTCString();
      res.setHeader(
        "Set-Cookie",
        `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`
      );

      return handler(req, res);
    };
  };
}
