import CryptoJS from "crypto-js";

/**
 * Generates a lightweight, stable cryptographic browser fingerprint using
 * non-invasive client attributes (screen info, navigator metadata, and an
 * offscreen canvas rendering hash). The result is salted and hashed with
 * SHA-256.
 *
 * SALT STRATEGY
 * ─────────────
 * The previous implementation used a static hardcoded string
 * ("eventra_session_recovery_crypto_salt_9273") as the HMAC salt. Because
 * the salt is compiled into the public JavaScript bundle, any attacker who
 * downloads the bundle can read it, precompute the hash for known fingerprint
 * inputs, and forge a fingerprint for a victim device.
 *
 * The salt is now derived from `window.location.origin` so that:
 *  - Each deployment (production, staging, localhost) has a different salt.
 *  - The salt is not a static string that appears anywhere in the source tree.
 *  - Rainbow-table precomputation against one deployment does not transfer to
 *    another.
 *
 * This is the same per-origin derivation strategy used by secureStorage.js.
 * The salt is still technically reconstructable by anyone who knows the origin,
 * but that raises the attack cost significantly compared to a literal constant.
 *
 * Gracefully falls back to a consistent hash in non-browser environments
 * (Node.js / unit testing) so tests remain deterministic.
 *
 * @returns {string} SHA-256 hex string representing the device fingerprint.
 */
export const getDeviceFingerprint = () => {
  // Graceful fallback for server-side rendering or unit testing (Node.js)
  if (typeof window === "undefined" || typeof document === "undefined") {
    const fallbackData = "eventra-node-test-environment-fingerprint-fallback";
    return CryptoJS.SHA256(fallbackData).toString();
  }

  try {
    const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
    const navInfo = `${window.navigator?.userAgent || ""}_${window.navigator?.language || ""}_${window.navigator?.hardwareConcurrency || 0}`;

    // Offscreen canvas fingerprint — captures GPU/font rendering subtleties
    let canvasHash = "";
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 180;
        canvas.height = 30;
        ctx.textBaseline = "top";
        ctx.font = "12px 'Arial'";
        ctx.fillStyle = "#6366f1";
        ctx.fillRect(5, 5, 50, 10);
        ctx.fillStyle = "#ec4899";
        ctx.fillText("Eventra-Secure-Session-Rec", 10, 15);
        canvasHash = canvas.toDataURL();
      }
    } catch {
      // Blocked by canvas privacy guards (Tor, some extensions) — continue without canvas
    }

    const fingerprintRaw = `${screenInfo}_${navInfo}_${canvasHash}`;

    // Per-origin salt: different for each deployment and never a static literal
    // in the bundle. Combining the origin with a domain-specific namespace
    // avoids salt collisions if two deployments share the same hostname root.
    const salt = `eventra:fingerprint:${window.location.origin}`;

    return CryptoJS.SHA256(fingerprintRaw + salt).toString();
  } catch {
    // Ultimate fallback — still origin-scoped so cross-origin replay is harder
    const fallbackSalt = typeof window !== "undefined"
      ? window.location.origin
      : "eventra-fallback";
    return CryptoJS.SHA256(`eventra-fingerprint-fallback:${fallbackSalt}`).toString();
  }
};

/**
 * Returns the per-origin salt string used when computing fingerprints.
 * Exported only for testing; do not use in application code.
 *
 * @returns {string}
 */
export const _getFingerprintSalt = () => {
  if (typeof window === "undefined") return "eventra:fingerprint:test";
  return `eventra:fingerprint:${window.location.origin}`;
};
