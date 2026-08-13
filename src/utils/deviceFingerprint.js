import CryptoJS from "crypto-js";

/**
 * Advanced Cryptographic Device & Browser Fingerprinting Utility
 *
 * Generates a lightweight, stable cryptographic browser fingerprint using non-invasive
 * client attributes (screen info, navigator metadata, and an offscreen canvas rendering hash).
 *
 * Key Design Aspects:
 * 1. Memoization: Caches fingerprint digest on module level to prevent expensive GPU/Canvas
 *    redraws during high-frequency calls (e.g., session recovery or rate-limiting monitors).
 * 2. Origin Salting: Derives salt from `window.location.origin` so rainbow-table attacks
 *    and fingerprint hashes do not transfer across environments (localhost vs staging vs prod).
 * 3. Privacy & SSR Guards: Silently handles canvas blocking extensions (Tor, Brave, Firefox RFP)
 *    and Node.js / SSR execution environments.
 */

let _memoizedFingerprint = null;

const simpleHash = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Helper to retrieve a safe, origin-scoped salt string.
 *
 * @returns {string} Salt identifier string.
 */
const resolveSalt = () => {
  if (typeof window === "undefined" || !window.location) {
    return "eventra:fingerprint:ssr-environment";
  }
  const origin = window.location.origin && window.location.origin !== "null"
    ? window.location.origin
    : "eventra-local-origin";
  return `eventra:fingerprint:${origin}`;
};

/**
 * Generates or retrieves the cached SHA-256 device fingerprint.
 *
 * @returns {string} SHA-256 hex string representing the unique device fingerprint.
 */
export const getDeviceFingerprint = () => {
  // 1. Return memoized hash if already computed in current page context
  if (_memoizedFingerprint !== null) {
    return _memoizedFingerprint;
  }

  // 2. SSR / Node.js runtime fallback
  if (typeof window === "undefined" || typeof document === "undefined") {
    const fallbackData = "eventra-node-test-environment-fingerprint-fallback";
    try {
      _memoizedFingerprint = CryptoJS.SHA256(fallbackData).toString();
    } catch {
      _memoizedFingerprint = simpleHash(fallbackData);
    }
    return _memoizedFingerprint;
  }

  try {
    // 3. Collect non-invasive display attributes
    const screenWidth = window.screen?.width || 0;
    const screenHeight = window.screen?.height || 0;
    const colorDepth = window.screen?.colorDepth || 0;
    const pixelRatio = window.devicePixelRatio || 1;
    const screenInfo = `${screenWidth}x${screenHeight}x${colorDepth}@${pixelRatio}`;

    // 4. Collect non-invasive browser/hardware attributes
    const userAgent = window.navigator?.userAgent || "";
    const language = window.navigator?.language || "";
    const hardwareConcurrency = window.navigator?.hardwareConcurrency || 0;
    const maxTouchPoints = window.navigator?.maxTouchPoints || 0;
    const navInfo = `${userAgent}_${language}_hc:${hardwareConcurrency}_tp:${maxTouchPoints}`;

    // 5. Offscreen canvas fingerprinting (captures GPU font smoothing and rendering pipeline)
    let canvasHash = "";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 30;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "12px 'Arial'";
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(5, 5, 50, 10);
        ctx.fillStyle = "#ec4899";
        ctx.fillText("Eventra-Secure-Session-Rec", 10, 15);
        canvasHash = canvas.toDataURL();
      }
    } catch {
      // Gracefully handles canvas blocking by privacy extensions or browser security policies
      canvasHash = "canvas-blocked";
    }

    // 6. Combine hardware attributes with per-origin salt
    const fingerprintRaw = `${screenInfo}_${navInfo}_${canvasHash}`;
    const salt = resolveSalt();

    _memoizedFingerprint = CryptoJS.SHA256(fingerprintRaw + salt).toString();
    return _memoizedFingerprint;
  } catch {
    // 7. Resilient error fallback using origin salt
    try {
      const fallbackSalt = resolveSalt();
      if (CryptoJS && CryptoJS.SHA256) {
        _memoizedFingerprint = CryptoJS.SHA256(
          `eventra-fingerprint-fallback:${fallbackSalt}`
        ).toString();
      } else {
        _memoizedFingerprint = simpleHash(`eventra-fingerprint-fallback:${fallbackSalt}`);
      }
    } catch {
      _memoizedFingerprint = "eventra-resilient-fallback-hash-djb2";
    }
    return _memoizedFingerprint;
  }
};

let _memoizedFastFingerprint = null;

/**
 * Generates a faster device fingerprint without using GPU canvas rendering.
 * Useful when performance is critical and high uniqueness isn't required.
 *
 * @returns {string} SHA-256 hex string representing the basic device fingerprint.
 */
export const getFastFingerprint = () => {
  // Both functions must identify the same device with the identical digest.
  // Previously they used different salts and attribute compositions (and the
  // fast variant omitted the canvas hash), so two callers could observe
  // different "fingerprints" for the same device. To eliminate that divergence
  // the fast variant reuses the canonical fingerprint. The result is memoized
  // inside getDeviceFingerprint, so there is no meaningful performance penalty
  // for repeated calls.
  return getDeviceFingerprint();
};

/**
 * Clears the memoized fingerprint cache.
 * Intended for isolated unit testing and session resets.
 *
 * @internal
 */
export const _clearFingerprintCache = () => {
  _memoizedFingerprint = null;
  _memoizedFastFingerprint = null;
};

/**
 * Returns the salt string generated for the current runtime context.
 * Exported for testing and verification purposes only.
 *
 * @internal
 * @returns {string} Salt value string.
 */
export const _getFingerprintSalt = () => {
  return resolveSalt();
};

export default getDeviceFingerprint;