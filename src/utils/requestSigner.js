/**
 * requestSigner.js
 *
 * Lightweight request-signing utilities using the Web Crypto API.
 *
 * Works in BOTH browsers (window.crypto.subtle) and Node.js ≥ 19
 * (globalThis.crypto.subtle). No `import crypto from "crypto"` because
 * the Node.js built-in module is unavailable in the browser and would
 * crash the bundle.
 */

// Resolve a crypto-like object available in the current environment.
// Browsers: window.crypto.subtle. Node ≥ 19: globalThis.crypto.subtle.
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
 * Generate a 16-byte cryptographically random hex string (32 chars).
 * Uses crypto.getRandomValues which is available in browsers and Node ≥ 19.
 */
export function generateNonce() {
  const c = getCrypto();
  if (!c) {
    throw new Error("generateNonce: Web Crypto API is not available in this environment");
  }
  const bytes = c.getRandomValues(new Uint8Array(16));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateTimestamp() {
  return Date.now().toString();
}

// HMAC SHA-256 helper. Returns a hex string.
// Async because the Web Crypto subtle API is promise-based.
async function hmacSha256Hex(secret, data) {
  const c = getCrypto();
  if (!c) {
    throw new Error("createSignature: Web Crypto API is not available in this environment");
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
}

export async function createSignature(payload, timestamp, nonce, secret) {
  const data = JSON.stringify(payload) + timestamp + nonce;
  return hmacSha256Hex(secret, data);
}

export async function signRequest(payload, secret) {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const signature = await createSignature(payload, timestamp, nonce, secret);

  return {
    timestamp,
    nonce,
    signature,
  };
}
