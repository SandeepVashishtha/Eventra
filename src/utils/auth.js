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
  if (typeof payload.exp === 'undefined') return false;
  
  return payload.exp * 1000 < Date.now();
}

import crypto from "node:crypto"; // Paste this at the very top of your file

export function isTokenValid(token, secret = process.env.JWT_SECRET) {
  if (!token || typeof token !== "string") return false;
  if (isTokenExpired(token)) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;
  if (!secret) return false;

  // Re-create the HMAC SHA256 signature using the secret key
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url"); // base64url matches standard JWT encoding formats

  return signature === expectedSignature;
}

export function getTokenTTL(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return -1;
  
  // 🔥 FIX: Apply the CLOCK_SKEW_BUFFER so the TTL matches the expiration logic.
  // This prevents the background refresh timer from firing too late.
  return (payload.exp - CLOCK_SKEW_BUFFER) - Math.floor(Date.now() / 1000);
}