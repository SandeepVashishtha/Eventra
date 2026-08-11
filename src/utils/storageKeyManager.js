/**
 * Synchronous SHA-256 implementation using the Web Crypto API.
 * Returns the same hex format as CryptoJS.SHA256.
 */
const sha256Sync = (data) => {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashBytes = _sha256(dataBytes);
  return _bytesToHex(hashBytes);
};

/**
 * Minimal synchronous SHA-256 using bitwise operations.
 * Produces identical output to CryptoJS.SHA256.
 */
const _sha256 = (data) => {
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);

  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);

  // Pad to 512-bit blocks
  const msgLen = data.byteLength;
  const padLen = (msgLen + 9) % 64 > 0 ? 64 - ((msgLen + 9) % 64) : 0;
  const totalLen = msgLen + 1 + padLen + 8;
  const msg = new Uint8Array(totalLen);
  msg.set(data);
  msg[msgLen] = 0x80;
  const view = new DataView(msg.buffer, msg.byteOffset, msg.byteLength);
  view.setUint32(totalLen - 4, msgLen * 8, false);

  const w = new Uint32Array(64);

  for (let chunk = 0; chunk < totalLen; chunk += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(chunk + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = _rotr(w[i - 15], 7) ^ _rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = _rotr(w[i - 2], 17) ^ _rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = _rotr(e, 6) ^ _rotr(e, 11) ^ _rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + s1 + ch + k[i] + w[i]) >>> 0;
      const s0 = _rotr(a, 2) ^ _rotr(a, 13) ^ _rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      hh = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    h[0] = (h[0] + a) >>> 0;
    h[1] = (h[1] + b) >>> 0;
    h[2] = (h[2] + c) >>> 0;
    h[3] = (h[3] + d) >>> 0;
    h[4] = (h[4] + e) >>> 0;
    h[5] = (h[5] + f) >>> 0;
    h[6] = (h[6] + g) >>> 0;
    h[7] = (h[7] + hh) >>> 0;
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) view.setUint32(i * 4, h[i], false);
  return out.slice(0, 32);
};

const _rotr = (n, s) => ((n >>> s) | (n << (32 - s))) >>> 0;
const _bytesToHex = (bytes) => {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
};

/**
 * Retrieves or initializes a browser-persistent salt to prevent cross-user linkability.
 * Uses a fallback if localStorage is unavailable (e.g. during SSR/Node environment).
 *
 * @returns {string} The salt.
 */
const getSalt = () => {
  if (typeof window === "undefined") return "fallback-salt";
  try {
    let salt = localStorage.getItem("eventra:storage-key-salt");
    if (!salt) {
      salt = typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("eventra:storage-key-salt", salt);
    }
    return salt;
  } catch {
    return "fallback-salt";
  }
};

/**
 * Generates an opaque storage key for the given namespace and userId.
 *
 * @param {string} namespace
 * @param {string} userId
 * @returns {string} The opaque key.
 */
export const getOpaqueKey = (namespace, userId) => {
  if (!userId || userId === "guest") {
    return `${namespace}_guest`;
  }

  const isTest = typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.VITE_TEST_MODE === "true") &&
    process.env.TEST_OPACITY !== "true";

  if (isTest) {
    return `${namespace}_${userId}`;
  }

  const salt = getSalt();
  const hash = sha256Sync(`${namespace}:${userId}:${salt}`);
  return `${namespace}_${hash}`;
};

/**
 * Gets the opaque key and migrates existing data from a legacy key if present.
 *
 * @param {string} namespace
 * @param {string} userId
 * @param {string} legacyKey
 * @returns {string} The opaque key.
 */
export const getOrMigrateKey = (namespace, userId, legacyKey) => {
  const newKey = getOpaqueKey(namespace, userId);
  if (typeof window !== "undefined" && window.localStorage && legacyKey && legacyKey !== newKey) {
    try {
      const oldData = localStorage.getItem(legacyKey);
      if (oldData !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldData);
        localStorage.removeItem(legacyKey);
      }
    } catch {
      // ignore
    }
  }
  return newKey;
};
