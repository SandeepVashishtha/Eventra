const CSRF_COOKIE = "XSRF-TOKEN";
const CSRF_HEADER = "x-csrf-token";
const CSRF_MAX_AGE = 86400;

const isMutating = (method) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes(method?.toUpperCase());

const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    cookies[key] = decodeURIComponent(val);
  }
  return cookies;
};

const generateToken = () => crypto.randomUUID();

const setCsrfCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  const cookie = `${CSRF_COOKIE}=${token}; Path=/; Max-Age=${CSRF_MAX_AGE}; SameSite=Lax${isProd ? "; Secure" : ""}`;
  if (typeof res.setHeader === "function") {
    res.setHeader("Set-Cookie", cookie);
  } else if (typeof res.set === "function") {
    res.set({ "Set-Cookie": cookie });
  }
};

export function csrfProtection(req, res) {
  const method = req.method?.toUpperCase();

  if (method === "OPTIONS") return true;

  const cookies = parseCookies(req.headers?.cookie);
  const cookieToken = cookies[CSRF_COOKIE];

  if (!isMutating(method)) {
    if (!cookieToken) {
      setCsrfCookie(res, generateToken());
    }
    return true;
  }

  const headerToken = req.headers?.[CSRF_HEADER];

  if (!cookieToken || !headerToken) {
    res.status(403).json({ error: "CSRF token missing" });
    return false;
  }

  if (cookieToken !== headerToken) {
    res.status(403).json({ error: "CSRF token mismatch" });
    return false;
  }

  return true;
}
