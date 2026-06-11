import crypto from "crypto";

const usedNonces = new Map();

const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

export function validateSignature(
  payload,
  timestamp,
  nonce,
  signature,
  secret
) {
  const now = Date.now();

  if (!timestamp || !nonce || !signature) {
    return {
      valid: false,
      error: "Missing signature fields",
    };
  }

  const age = now - Number(timestamp);

  if (age > MAX_REQUEST_AGE_MS) {
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

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(
      JSON.stringify(payload) +
        timestamp +
        nonce
    )
    .digest("hex");

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

setInterval(() => {
  const now = Date.now();

  for (const [nonce, timestamp] of usedNonces) {
    if (
      now - timestamp >
      MAX_REQUEST_AGE_MS
    ) {
      usedNonces.delete(nonce);
    }
  }
}, 60000);