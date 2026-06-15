import { createConcurrencyLimiter } from "../api/_lib/concurrency.js";
import { checkGeoBlock } from "./geo.js";
import { checkRateLimit } from "./rate-limit.js";
import { verifyTicketAccess } from "./jwt.js";
import { addSecurityHeaders, validateBackendOrigin, getBackendOrigins, createSecurityHeaders } from "./csp.js";

const validationLimiter = createConcurrencyLimiter(5);

export const config = {
  matcher: "/api/:path*",
};

async function handleRequest(request) {
  const geoResponse = checkGeoBlock(request);
  if (geoResponse) return geoResponse;

  const url = new URL(request.url);

  if (request.method === "OPTIONS") return;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin) {
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
  }

  if (url.pathname.startsWith("/api/")) {
    const PUBLIC_PATHS = [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/reset-password",
      "/api/events",
      "/api/hackathons",
      "/api/projects",
      "/api/validate",
      "/api/health",
    ];

    const isPublicPath = PUBLIC_PATHS.some(path =>
      url.pathname.startsWith(path) &&
      (request.method === "GET" ||
        url.pathname.includes("/auth/") ||
        url.pathname.includes("/validate/"))
    );

    if (!isPublicPath) {
      const cookieHeader = request.headers.get("cookie") || "";
      const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
      if (!tokenMatch || !tokenMatch[1]) {
        return new Response(
          JSON.stringify({ error: "Unauthorized: Missing active user session" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
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
