import { safeJsonParse } from "./safeJsonParse.js";

/** Grace period (in seconds) to account for clock skew between browser and server. */
const CLOCK_SKEW_BUFFER = 30;

export function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
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
  if (typeof payload.exp === "undefined") return false;

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
