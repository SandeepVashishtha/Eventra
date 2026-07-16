import { validateSignature } from "../utils/signatureValidator.js";

export async function verifyRequestSignature(
  req,
  secret
) {
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
