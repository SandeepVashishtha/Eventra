import CryptoJS from "crypto-js";

const DEVICE_SALT_KEY = "eventra:device_salt";

/**
 * Returns a persistent per-device random salt, creating and storing one on
 * the first call. The salt is stored in localStorage so subsequent page loads
 * from the same browser produce the same fingerprint without relying on a
 * hardcoded constant that is visible in the bundle.
 *
 * This means two different browsers — even on identical hardware — produce
 * different fingerprints, preventing precomputation attacks.
 *
 * @returns {string} 64-character lowercase hex string unique to this browser
 */
const getOrCreateDeviceSalt = () => {
  try {
    const existing = localStorage.getItem(DEVICE_SALT_KEY);
    if (existing && existing.length === 64 && /^[0-9a-f]+$/.test(existing)) {
      return existing;
    }
  } catch {
    // localStorage unavailable — fall through to generate an ephemeral salt
  }

  // Generate 32 random bytes (256 bits) of entropy
  let hex;
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Non-secure fallback (Node.js environments without WebCrypto)
    try {
      const nodeCrypto = require("crypto");
      hex = nodeCrypto.randomBytes(32).toString("hex");
    } catch {
      // Absolute last resort — still better than a hardcoded constant since
      // it incorporates the current timestamp as entropy
      hex = CryptoJS.SHA256(
        String(Date.now()) + String(Math.random()) + String(performance?.now?.() ?? 0)
      ).toString();
    }
  }

  try {
    localStorage.setItem(DEVICE_SALT_KEY, hex);
  } catch {
    // Storage write failed (private browsing, quota exceeded, etc.)
    // Return the generated value without persisting — the fingerprint will
    // differ on the next page load, which degrades session recovery but
    // does not create a security vulnerability.
  }

  return hex;
};

/**
 * Returns a deterministic test-environment salt derived from a fixed seed
 * that is NOT embedded as a plaintext constant in the production bundle.
 * Used only when NODE_ENV === 'test' to allow stable fingerprints in unit tests.
 *
 * @returns {string}
 */
const getTestEnvironmentSalt = () => {
  const envSalt = process.env.REACT_APP_TEST_FINGERPRINT_SALT;
  if (envSalt && envSalt.length >= 16) {
    return CryptoJS.SHA256("test:" + envSalt).toString();
  }
  // No test salt configured — return a value that is clearly non-production
  return CryptoJS.SHA256("eventra:test-env:" + (process.env.NODE_ENV ?? "test")).toString();
};

/**
 * Generates a lightweight, stable cryptographic browser fingerprint using
 * non-invasive client attributes (screen info, navigator metadata, and an
 * offscreen canvas rendering hash), combined with a per-device random salt
 * that is generated once and stored in localStorage.
 *
 * The per-device salt means:
 *   - An attacker who knows the algorithm and the victim's screen resolution
 *     and user agent cannot precompute the fingerprint — they would also need
 *     the victim's unique salt, which is only accessible if they can already
 *     execute JavaScript in the victim's browser (at which point fingerprinting
 *     is the least of the security concerns).
 *   - Two browser sessions on the same device produce the same fingerprint as
 *     long as localStorage is not cleared.
 *   - Clearing localStorage generates a new salt and therefore a new
 *     fingerprint, which is the expected security behaviour.
 *
 * @returns {string} SHA-256 hex string representing the device fingerprint
 */
export const getDeviceFingerprint = () => {
  // Graceful fallback for server-side rendering or unit testing (Node.js)
  if (typeof window === "undefined" || typeof document === "undefined") {
    if (process.env.NODE_ENV === "test") {
      return CryptoJS.SHA256(getTestEnvironmentSalt()).toString();
    }
    // Server-side rendering — no device attributes available; return empty string
    // so callers can detect the non-browser context.
    return "";
  }

  try {
    const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
    const navInfo = `${window.navigator?.userAgent || ""}_${window.navigator?.language || ""}_${window.navigator?.hardwareConcurrency || 0}`;

    // Generate canvas fingerprint signature
    let canvasHash = "";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 180;
        canvas.height = 30;
        ctx.textBaseline = "top";
        ctx.font = "12px 'Arial'";
        ctx.fillStyle = "#6366f1"; // Indigo
        ctx.fillRect(5, 5, 50, 10);
        ctx.fillStyle = "#ec4899"; // Pink
        ctx.fillText("Eventra-Secure-Session-Rec", 10, 15);
        canvasHash = canvas.toDataURL();
      }
    } catch {
      // Canvas context blocked by privacy guards (e.g. Tor Browser, extensions)
    }

    const deviceSalt = getOrCreateDeviceSalt();
    const fingerprintRaw = `${screenInfo}_${navInfo}_${canvasHash}`;
    return CryptoJS.SHA256(fingerprintRaw + deviceSalt).toString();
  } catch {
    // Fallback if window attributes throw access violations — still use the
    // per-device salt so the fallback value is not globally predictable.
    try {
      const deviceSalt = getOrCreateDeviceSalt();
      return CryptoJS.SHA256("eventra:fallback:" + deviceSalt).toString();
    } catch {
      // Absolute last resort — no device salt available
      return CryptoJS.SHA256("eventra:ultimate-fallback:" + String(Date.now())).toString();
    }
  }
};
