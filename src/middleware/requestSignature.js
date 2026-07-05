import {
  validateSignature,
  startNonceCleanup,
} from "../utils/signatureValidator.js";

let cleanupStarted = false;

export function verifyRequestSignature(
  req,
  secret
) {
  // Lazily start nonce cleanup on first use — avoids module-scope side effects
  // that leak intervals in browser bundles.
  if (!cleanupStarted) {
    startNonceCleanup();
    cleanupStarted = true;
  }

  const timestamp =
    req.headers["x-timestamp"];

  const nonce =
    req.headers["x-nonce"];

  const signature =
    req.headers["x-signature"];

  return validateSignature(
    req.body,
    timestamp,
    nonce,
    signature,
    secret
  );
}
