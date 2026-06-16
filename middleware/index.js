import { createConcurrencyLimiter } from "../api/_lib/concurrency.js";
import { checkGeoBlock } from "./geo.js";
import { checkRateLimit } from "./rate-limit.js";
import { verifyTicketAccess, verifyJwt, parseTokenFromCookie } from "./jwt.js";
import { addSecurityHeaders, validateBackendOrigin, getBackendOrigins, createSecurityHeaders } from "./csp.js";

const validationLimiter = createConcurrencyLimiter(5);

const getSessionRiskState = async (sessionId) => {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (!kvUrl || !kvToken) return "active";

  try {
    const res = await fetch(`${kvUrl}/get/session:${sessionId}`, {
      headers: { Authorization: `Bearer ${kvToken}` }
    });
    if (!res.ok) return "active";
    const data = await res.json();
    if (!data || !data.result) return "invalidated";
    
    let sessionData = data.result;
    if (typeof sessionData === 'string') {
       sessionData = JSON.parse(sessionData);
    }
    
    // Check inactivity (2 hours)
    if (Date.now() - sessionData.lastActive > 2 * 60 * 60 * 1000 && sessionData.status === "active") {
       return "requires_reauth";
    }
    return sessionData.status || "active";
  } catch(e) {
    return "active";
  }
};

export const config = {
  matcher: "/api/:path*",
};

function checkOrigin(request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return null;

  try {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      return new Response(
        JSON.stringify({ error: "Forbidden: Invalid origin" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Forbidden: Malformed origin" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  return null;
}

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/reset-password",
  "/api/auth/reauth",
  "/api/events",
  "/api/hackathons",
  "/api/projects",
  "/api/validate",
  "/api/health",
];

const LISTING_PATHS = new Set(["/api/events", "/api/hackathons", "/api/projects"]);

function isPathPublic(pathname, method) {
  const isMatch = PUBLIC_PATHS.some(path => {
    if (LISTING_PATHS.has(path)) {
      // Only base listings or specific public endpoints are allowed without authentication
      return (
        pathname === path ||
        pathname === `${path}/` ||
        (pathname.startsWith(`${path}/`) &&
          !pathname.includes("/admin/") &&
          !pathname.includes("/settings") &&
          !pathname.includes("/export"))
      );
    }
    return pathname.startsWith(path);
  });

  return isMatch && (method === "GET" || pathname.includes("/auth/") || pathname.includes("/validate/"));
}

async function authenticateRequest(request) {
  const token = parseTokenFromCookie(request);
  if (!token) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Missing active user session" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || !jwtSecret.trim()) {
    return new Response(
      JSON.stringify({ error: "Server authentication misconfiguration" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = await verifyJwt(token, jwtSecret);
  if (!payload) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (payload.sessionId) {
    const status = await getSessionRiskState(payload.sessionId);
    if (status === "invalidated") {
      return new Response(
        JSON.stringify({ error: "Session invalidated" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    if (status === "requires_reauth") {
      return new Response(
        JSON.stringify({ error: "Re-authentication required", code: "REQUIRES_REAUTH" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return null;
}

async function handleRequest(request) {
  const geoResponse = checkGeoBlock(request);
  if (geoResponse) return geoResponse;

  const url = new URL(request.url);

  if (request.method === "OPTIONS") return;

  const originResponse = checkOrigin(request);
  if (originResponse) return originResponse;

  if (url.pathname.startsWith("/api/")) {
    if (!isPathPublic(url.pathname, request.method)) {
      const authResponse = await authenticateRequest(request);
      if (authResponse) return authResponse;
    }
  }

  const { limited, window } = await checkRateLimit(request);
  if (limited) {
    const responseHeaders = new Headers({
      "Content-Type": "application/json",
      "Retry-After": String(window),
    });
    addSecurityHeaders(responseHeaders);
    responseHeaders.set("Access-Control-Allow-Origin", url.origin);
    responseHeaders.set("Access-Control-Allow-Credentials", "true");
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: responseHeaders,
      },
    );
  }

  if (url.pathname.startsWith("/api/tickets/")) {
    const ticketResponse = await verifyTicketAccess(request);
    if (ticketResponse) return ticketResponse;
  }

  return;
}

export { validateBackendOrigin, getBackendOrigins } from "./csp.js";

const SECURITY_HEADERS_OBJ = createSecurityHeaders();
export { SECURITY_HEADERS_OBJ as SECURITY_HEADERS };

export default async function middleware(request) {
  return validationLimiter.run(() => handleRequest(request));
}
