import crypto from "crypto";

export function generateNonce() {
  return crypto.randomBytes(16).toString("hex");
}

export function generateTimestamp() {
  return Date.now().toString();
}

export function createSignature(payload, timestamp, nonce, secret) {
  const data = JSON.stringify(payload) + timestamp + nonce;

  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function signRequest(payload, secret) {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();

  const signature = createSignature(payload, timestamp, nonce, secret);

  return {
    timestamp,
    nonce,
    signature,
  };
}
