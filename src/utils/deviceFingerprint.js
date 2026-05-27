import CryptoJS from "crypto-js";

/**
 * Generates a lightweight, stable cryptographic browser fingerprint using
 * non-invasive client attributes (screen info, navigator metadata, and an offscreen canvas rendering hash).
 * Incorporates a system-level salt and hashes the result with SHA-256.
 *
 * Gracefully falls back to a consistent hash in non-browser environments (Node.js/testing).
 *
 * @returns {string} SHA-256 string representing the unique device fingerprint
 */
export const getDeviceFingerprint = () => {
  // Graceful fallback for server-side rendering or unit testing (Node.js)
  if (typeof window === "undefined" || typeof document === "undefined") {
    const fallbackData = "eventra-node-test-environment-fallback-salt-99";
    return CryptoJS.SHA256(fallbackData).toString();
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
    } catch (_) {
      // Ignored if canvas context is blocked by privacy guards (e.g. Tor or extensions)
    }

    const fingerprintRaw = `${screenInfo}_${navInfo}_${canvasHash}`;
    const salt = "eventra_session_recovery_crypto_salt_9273";
    return CryptoJS.SHA256(fingerprintRaw + salt).toString();
  } catch (e) {
    // Ultimate fallback if window attributes or screen objects throws access violations
    return CryptoJS.SHA256("eventra-ultimate-secure-fallback-signature-888").toString();
  }
};
