/**
 * api/_lib/ticketToken.js
 *
 * Generates and verifies cryptographically secure ticket tokens.
 * Tokens are UUID v4 strings — opaque to the client and safe to embed
 * in QR codes without leaking internal identifiers.
 */

import { getJwtSecret } from "./jwtSecret.js";
import jwt from "jsonwebtoken";

/**
 * Generates a unique ticket token using crypto.randomUUID().
 * Falls back to a crypto.getRandomValues-based polyfill for environments
 * where randomUUID is unavailable.
 *
 * @returns {string} A UUID v4 string (e.g. "550e8400-e29b-41d4-a716-446655440000")
 */
export function generateTicketToken() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Polyfill: use getRandomValues for older Node versions
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }
  throw new Error("Secure random generation is not available in this environment.");
}

/**
 * Signs a ticket payload into a short-lived JWT for QR embedding.
 * Contains only the public-safe fields: ticketToken, eventId, registrationId.
 * Never embeds PII (name, email, phone).
 *
 * @param {Object} params
 * @param {string} params.ticketToken  - The UUID ticket token
 * @param {string|number} params.eventId - The event identifier
 * @param {string} params.registrationId - The registration identifier
 * @returns {string} Signed JWT string
 */
export function signTicketJwt({ ticketToken, eventId, registrationId }) {
  const secret = getJwtSecret();
  return jwt.sign(
    { ticketToken, eventId: String(eventId), registrationId },
    secret,
    { expiresIn: "365d", subject: "ticket" }
  );
}

/**
 * Verifies and decodes a ticket JWT.
 *
 * @param {string} token - The JWT string to verify
 * @returns {{ ticketToken: string, eventId: string, registrationId: string } | null}
 *   Decoded payload on success, null if invalid or expired.
 */
export function verifyTicketJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret, { subject: "ticket" });
    if (!payload?.ticketToken) return null;
    return {
      ticketToken: payload.ticketToken,
      eventId: payload.eventId,
      registrationId: payload.registrationId,
    };
  } catch {
    return null;
  }
}
