import { safeJsonParse } from "./safeJsonParse.js";

/** Grace period (in seconds) to account for clock skew between browser and server. */
const CLOCK_SKEW_BUFFER = 30;

// RFC 4648 base64url alphabet. Validating before atob avoids InvalidCharacterError
// from atob on non-base64 inputs (a stray space, a non-ASCII character, an
// unusual encoding from a custom auth server), which would otherwise be
// silently swallowed by the outer try/catch and surface as a generic "null"
// to all callers, masking the real failure.
const BASE64URL_RE = /^[A-Za-z0-9_-]+={0,2}$/;

export function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    if (!BASE64URL_RE.test(base64)) return null;

    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return safeJsonParse(jsonPayload, {});
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  // If 'exp' is missing, the token does not expire by time per RFC 7519
  if (typeof payload.exp === 'undefined') return false;
  
  return payload.exp * 1000 < Date.now() + CLOCK_SKEW_BUFFER * 1000;
}

export function isTokenValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;
  
  return !isTokenExpired(token);
}

export function getTokenTTL(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return 0;
  }
  if (typeof payload.exp === "undefined") {
    return -1;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - now - CLOCK_SKEW_BUFFER;
}