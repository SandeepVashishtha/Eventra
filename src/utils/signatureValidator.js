/**
 * Lightweight HMAC-SHA256 signature validation using the Web Crypto API.
 *
 * Compatible with both browsers (window.crypto.subtle) and Node.js ≥ 19
 * (globalThis.crypto.subtle). No `import crypto from "crypto"` because
 * the Node.js built-in module is unavailable in the browser and crashes
 * the bundle on load.
 */

import CryptoJS from "crypto-js";

const usedNonces = new Map();

const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

const hmacSha256Hex = (secret, data) => CryptoJS.HmacSHA256(data, secret).toString();

export function validateSignature(
  payload,
  timestamp,
  nonce,
  signature,
  secret
) {
  const now = Date.now();

  if (!timestamp || !nonce || !signature) {
    return {
      valid: false,
      error: "Missing signature fields",
    };
  }

  const age = now - Number(timestamp);

  if (Math.abs(age) > MAX_REQUEST_AGE_MS) {
    return {
      valid: false,
      error: "Expired request",
    };
  }

  if (usedNonces.has(nonce)) {
    return {
      valid: false,
      error: "Replay attack detected",
    };
  }

  const expectedSignature = hmacSha256Hex(
    secret,
    JSON.stringify(payload) + timestamp + nonce
  );

  if (expectedSignature !== signature) {
    return {
      valid: false,
      error: "Invalid signature",
    };
  }

  usedNonces.set(nonce, now);

  return {
    valid: true,
  };
}

const cleanupInterval = setInterval(() => {
  const now = Date.now();

  for (const [nonce, timestamp] of usedNonces) {
    if (now - timestamp > MAX_REQUEST_AGE_MS) {
      usedNonces.delete(nonce);
    }
  }
}, 60000);

if (cleanupInterval && typeof cleanupInterval.unref === "function") {
  cleanupInterval.unref();
}
