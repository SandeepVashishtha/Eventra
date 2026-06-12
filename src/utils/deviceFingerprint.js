import CryptoJS from "crypto-js";

/**
 * Generates a lightweight, stable cryptographic browser fingerprint using
 * non-invasive client attributes (screen info, navigator metadata, and an
 * offscreen canvas rendering hash). The result is salted and hashed with
 * SHA-256.
 *
 * SALT STRATEGY
 * ─────────────
 * The salt is derived from `window.location.origin` so that each deployment
 * (production, staging, localhost) produces a different fingerprint and
 * rainbow-table precomputation does not transfer across deployments.
 *
 * MEMOIZATION
 * ────────────
 * The previous implementation ran the full canvas allocation and GPU-rendered
 * draw on every call. `getDeviceFingerprint()` is invoked from `saveSession()`
 * in `SessionRecoveryContext.js` which fires up to once per second during user
 * activity. Each call created a 180×30 canvas element, called `fillRect`,
 * `fillText`, and `toDataURL()` — all synchronous main-thread GPU operations.
 *
 * The device fingerprint is stable for the lifetime of the page: the user's
 * screen resolution, user-agent, and canvas rendering do not change mid-session.
 * Memoizing after the first computation reduces the per-call cost from O(GPU)
 * to O(1) for all subsequent calls without changing the fingerprint value.
 *
 * The cache is module-level so it persists for the page lifetime and is reset
 * on navigation (new page load reinitialises the module).
 *
 * @returns {string} SHA-256 hex string representing the device fingerprint.
 */

let _memoizedFingerprint = null;

export const getDeviceFingerprint = () => {
  // Return cached value if already computed this page load
  if (_memoizedFingerprint !== null) {
    return _memoizedFingerprint;
  }

  // Graceful fallback for server-side rendering or unit testing (Node.js)
  if (typeof window === "undefined" || typeof document === "undefined") {
    const fallbackData = "eventra-node-test-environment-fingerprint-fallback";
    _memoizedFingerprint = CryptoJS.SHA256(fallbackData).toString();
    return _memoizedFingerprint;
  }

  try {
    const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`;
    const navInfo = `${window.navigator?.userAgent || ""}_${window.navigator?.language || ""}_${window.navigator?.hardwareConcurrency || 0}`;

    // Offscreen canvas fingerprint — captures GPU/font rendering subtleties.
    // Created once here and discarded; the resulting hash is memoized so
    // no canvas element is allocated on subsequent calls.
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

    _memoizedFingerprint = CryptoJS.SHA256(fingerprintRaw + salt).toString();
    return _memoizedFingerprint;
  } catch {
    // Ultimate fallback — still origin-scoped so cross-origin replay is harder
    const fallbackSalt =
      typeof window !== "undefined" ? window.location.origin : "eventra-fallback";
    _memoizedFingerprint = CryptoJS.SHA256(
      `eventra-fingerprint-fallback:${fallbackSalt}`,
    ).toString();
    return _memoizedFingerprint;
  }
};

/**
 * Clears the memoized fingerprint. Intended for use in tests only so each
 * test starts with a fresh computation.
 *
 * @internal
 */
export const _clearFingerprintCache = () => {
  _memoizedFingerprint = null;
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
