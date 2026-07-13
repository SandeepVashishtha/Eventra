/**
 * Lightweight HMAC-SHA256 signature validation using the Web Crypto API.
 *
 * Compatible with both browsers (window.crypto.subtle) and Node.js ≥ 19
 * (globalThis.crypto.subtle). No `import crypto from "crypto"` because
 * the Node.js built-in module is unavailable in the browser and crashes
 * the bundle on load.
 */

const usedNonces = new Map();

const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

// Resolve a crypto-like object available in the current environment.
const getCrypto = () => {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto;
  }
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    return window.crypto;
  }
  return null;
};

/**
 * Compute HMAC-SHA256 using the Web Crypto API.
 * Returns a hex string identical to what crypto.createHmac('sha256', secret)
 * would produce, but works in browsers.
 */
const hmacSha256Hex = async (secret, data) => {
  const c = getCrypto();
  if (!c) {
    throw new Error("HMAC: Web Crypto API is not available in this environment");
  }
  const enc = new TextEncoder();
  const key = await c.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await c.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export async function validateSignature(
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

  const expectedSignature = await hmacSha256Hex(
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

// Cleanup of expired nonces is now handled lazily within validateSignature()
// instead of a module-scoped setInterval to prevent memory leaks in the browser.
