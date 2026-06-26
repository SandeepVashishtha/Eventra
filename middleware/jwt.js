import { getJwtSecret, createJwtConfigErrorResponse } from "../api/_lib/jwtSecret.js";

const base64urlDecode = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

const base64urlEncode = (bytes) => {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const decodeBase64UrlJson = (str) => {
  try {
    const bytes = base64urlDecode(str);
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
};

export const signJwt = async (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  
  const encoder = new TextEncoder();
  const headerEncoded = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadEncoded = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  
  const signingInput = `${headerEncoded}.${payloadEncoded}`;
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput),
  );
  
  const signatureEncoded = base64urlEncode(new Uint8Array(signature));
  
  return `${signingInput}.${signatureEncoded}`;
};

export const verifyJwt = async (token, secret) => {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerStr, payloadStr, signatureStr] = parts;

  const header = decodeBase64UrlJson(headerStr);
  if (!header || header.alg !== "HS256") return null;

  const payload = decodeBase64UrlJson(payloadStr);
  if (!payload) return null;

  if (payload.exp && payload.exp * 1000 <= Date.now()) return null;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signingInput = `${headerStr}.${payloadStr}`;
    const signatureBytes = base64urlDecode(signatureStr);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(signingInput),
    );

    return valid ? payload : null;
  } catch {
    return null;
  }
};

const TICKET_ROLES = new Set([
  "ORGANIZER",
  "VOLUNTEER",
  "ADMIN",
  "SUPER_ADMIN",
  "EVENT_MANAGER",
]);

export const parseTokenFromCookie = (request) => {
  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader.length > 4096) {
    return null;
  }
  const tokenMatch = cookieHeader.match(/(?:^|;\s*)token\s*=\s*([^;]*)/);
  return tokenMatch ? tokenMatch[1] : null;
};

const forbiddenResponse = (url) =>
  new Response(
    JSON.stringify({ error: "Forbidden: Insufficient permissions for ticket routes" }),
    {
      status: 403,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": url.origin,
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
      },
    },
  );

export async function verifyTicketAccess(request) {
  let jwtSecret;
  try {
    jwtSecret = getJwtSecret();
  } catch (error) {
    console.error("[middleware] JWT_SECRET is not configured. Rejecting ticket route request.");
    return createJwtConfigErrorResponse();
  }

  const token = parseTokenFromCookie(request);
  if (!token) return forbiddenResponse(new URL(request.url));

  const payload = await verifyJwt(token, jwtSecret);
  if (!payload) return forbiddenResponse(new URL(request.url));

  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  const hasAccess = roles.some((role) =>
    TICKET_ROLES.has(String(role).toUpperCase()),
  );

  if (!hasAccess) return forbiddenResponse(new URL(request.url));
  return null;
}
