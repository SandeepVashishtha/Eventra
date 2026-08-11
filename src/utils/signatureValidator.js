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
let lastCleanup = Date.now();

/**
 * Deterministically serialize an object by sorting its keys.
 * Ensures equivalent payloads always produce the same JSON string.
 */
const deterministicStringify = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {})
  );
};

const hmacSha256Hex = (secret, data) => CryptoJS.HmacSHA256(data, secret).toString();

export function validateSignature(
  payload,
  timestamp,
  nonce,
  signature,
  secret
) {
  const now = Date.now();

  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    for (const [n, ts] of usedNonces) {
      if (now - ts > MAX_REQUEST_AGE_MS) {
        usedNonces.delete(n);
      }
    }
  }

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
    deterministicStringify(payload) + timestamp + nonce
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

// Cleanup of expired nonces is now handled lazily within validateSignature()
// instead of a module-scoped setInterval to prevent memory leaks in the browser.
