/**
 * api/tickets/checkin.js
 *
 * POST /api/tickets/checkin
 *
 * Marks an attendee as checked in.
 * Prevents duplicate check-ins.
 *
 * Request body:
 *   { "token": "<jwt or uuid>" }
 *
 * Response (success):
 *   { success: true, message: "Check-in successful", ticket: { ... } }
 *
 * Response (already checked in):
 *   { success: false, message: "Attendee already checked in" }
 *
 * Response (invalid token):
 *   { success: false, message: "Invalid ticket token" }
 */

import { corsResponse } from "../_lib/_cors.js";
import { verifyTicketJwt } from "../_lib/ticketToken.js";
import { getTicketByToken, checkInTicket } from "../_lib/ticketStorage.js";

/**
 * Sanitizes a string input.
 *
 * @param {*} value
 * @returns {string}
 */
function sanitizeToken(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().slice(0, 512);
}

/**
 * Check-in handler.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} [deps] - Injectable for testing
 * @param {Function} [deps.getTicket]       - async (token) => record | null
 * @param {Function} [deps.performCheckIn]  - async (token) => result
 * @param {Function} [deps.decodeToken]     - (jwt) => payload | null
 */
export default async function checkInHandler(req, res, deps = {}) {
  // OPTIONS pre-flight
  if (req.method === "OPTIONS") {
    return corsResponse(req, res, 200, {});
  }

  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const {
    getTicket = getTicketByToken,
    performCheckIn = checkInTicket,
    decodeToken = verifyTicketJwt,
  } = deps;

  const rawToken = req.body?.token ?? null;
  const token = sanitizeToken(rawToken);

  if (!token) {
    return corsResponse(req, res, 400, { error: "Token is required" });
  }

  // Resolve the raw ticket token from a JWT wrapper if present
  let lookupToken = token;
  const decoded = decodeToken(token);
  if (decoded?.ticketToken) {
    lookupToken = decoded.ticketToken;
  }

  // Verify ticket exists before attempting check-in
  const ticket = await getTicket(lookupToken);
  if (!ticket) {
    return corsResponse(req, res, 200, {
      success: false,
      message: "Invalid ticket token",
    });
  }

  const result = await performCheckIn(lookupToken);

  if (!result.success) {
    return corsResponse(req, res, 200, {
      success: false,
      message: result.message || "Check-in failed",
    });
  }

  return corsResponse(req, res, 200, {
    success: true,
    message: "Check-in successful",
    ticket: {
      ticketId: result.ticket.registrationId,
      eventId: result.ticket.eventId,
      attendee: result.ticket.attendeeName || "Attendee",
      checkedIn: result.ticket.checkedIn,
      checkedInAt: result.ticket.checkedInAt,
    },
  });
}
