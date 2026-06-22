/**
 * api/tickets/verify.js
 *
 * GET  /api/tickets/verify/:token
 * POST /api/tickets/verify  { "token": "..." }
 *
 * Verifies a ticket token and returns attendee check-in status.
 * Never exposes internal database IDs in the response.
 *
 * Response (valid):
 *   { valid: true, ticketId, eventId, attendee, checkedIn, checkedInAt }
 *
 * Response (invalid):
 *   { valid: false }
 */

import { corsResponse } from "../auth/_cors.js";
import { verifyTicketJwt } from "../_lib/ticketToken.js";
import { getTicketByToken } from "../_lib/ticketStorage.js";

/**
 * Sanitizes a string input — trims whitespace and ensures it is a string.
 *
 * @param {*} value
 * @returns {string}
 */
function sanitizeToken(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().slice(0, 512);
}

/**
 * Verify ticket handler.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} [deps] - Injectable for testing
 * @param {Function} [deps.getTicket]     - async (token) => record | null
 * @param {Function} [deps.decodeToken]   - (jwt) => payload | null
 */
export default async function verifyTicket(req, res, deps = {}) {
  // OPTIONS pre-flight
  if (req.method === "OPTIONS") {
    return corsResponse(req, res, 200, {});
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const {
    getTicket = getTicketByToken,
    decodeToken = verifyTicketJwt,
  } = deps;

  // Extract token from URL param (GET) or request body (POST)
  const rawToken =
    req.params?.token ??
    req.query?.token ??
    req.body?.token ??
    null;

  const token = sanitizeToken(rawToken);
  if (!token) {
    return corsResponse(req, res, 400, { error: "Token is required" });
  }

  // The QR code may contain either:
  //  a) A plain UUID ticketToken (legacy / simple mode)
  //  b) A signed JWT embedding { ticketToken, eventId, registrationId }
  let lookupToken = token;

  // Attempt JWT decode first
  const decoded = decodeToken(token);
  if (decoded?.ticketToken) {
    lookupToken = decoded.ticketToken;
  }

  const ticket = await getTicket(lookupToken);
  if (!ticket) {
    return corsResponse(req, res, 200, { valid: false });
  }

  return corsResponse(req, res, 200, {
    valid: true,
    ticketId: ticket.registrationId,
    eventId: ticket.eventId,
    attendee: ticket.attendeeName || "Attendee",
    checkedIn: ticket.checkedIn ?? false,
    checkedInAt: ticket.checkedInAt ?? null,
  });
}
