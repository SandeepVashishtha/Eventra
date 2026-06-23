/**
 * api/tickets/token.js
 *
 * POST /api/tickets/token
 *
 * Generates a signed JWT ticket token for QR code generation.
 * Uses configurable and event-aware expiration strategies.
 *
 * Request body:
 *   {
 *     "registrationId": "string",
 *     "eventId": "string",
 *     "eventEndTime": "string (ISO date, optional)"
 *   }
 *
 * Response (success):
 *   { success: true, token: "jwt-string", registrationId: "..." }
 *
 * Response (error):
 *   { success: false, error: "error message" }
 */

import { corsResponse } from "../auth/_cors.js";
import { generateTicketToken, signTicketJwt } from "../_lib/ticketToken.js";
import { saveTicket, getTicketByRegistrationId } from "../_lib/ticketStorage.js";

/**
 * Sanitizes a string input.
 *
 * @param {*} value
 * @returns {string}
 */
function sanitizeString(value) {
  if (!value || typeof value !== "string") return "";
  return value.trim().slice(0, 512);
}

/**
 * Token generation handler.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Object} [deps] - Injectable for testing
 * @param {Function} [deps.generateToken] - () => string (UUID)
 * @param {Function} [deps.signJwt] - (params) => string (JWT)
 * @param {Function} [deps.getTicket] - async (registrationId) => record | null
 * @param {Function} [deps.saveTicketRecord] - async (ticket) => record
 */
export default async function tokenHandler(req, res, deps = {}) {
  // OPTIONS pre-flight
  if (req.method === "OPTIONS") {
    return corsResponse(req, res, 200, {});
  }

  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const {
    generateToken = generateTicketToken,
    signJwt = signTicketJwt,
    getTicket = getTicketByRegistrationId,
    saveTicketRecord = saveTicket,
  } = deps;

  const { registrationId, eventId, eventEndTime } = req.body || {};

  const sanitizedRegId = sanitizeString(registrationId);
  const sanitizedEventId = sanitizeString(eventId);

  if (!sanitizedRegId || !sanitizedEventId) {
    return corsResponse(req, res, 400, {
      success: false,
      error: "registrationId and eventId are required"
    });
  }

  try {
    // Check if ticket already exists
    const existingTicket = await getTicket(sanitizedRegId);

    let ticketToken;
    let attendeeName = "Attendee";
    let userId = "unknown";

    if (existingTicket) {
      // Reuse existing ticket token
      ticketToken = existingTicket.ticketToken;
      attendeeName = existingTicket.attendeeName || "Attendee";
      userId = existingTicket.userId || "unknown";
    } else {
      // Generate new ticket token
      ticketToken = generateToken();

      // Save ticket record
      await saveTicketRecord({
        ticketToken,
        registrationId: sanitizedRegId,
        eventId: sanitizedEventId,
        userId,
        attendeeName,
        createdAt: new Date().toISOString(),
        checkedIn: false,
        checkedInAt: null,
      });
    }

    // Sign JWT with configurable/event-aware expiration
    const jwtToken = signJwt({
      ticketToken,
      eventId: sanitizedEventId,
      registrationId: sanitizedRegId,
      eventEndTime: eventEndTime || null,
    });

    console.log("[TICKET_TOKEN] Generated token for registration:", sanitizedRegId);

    return corsResponse(req, res, 200, {
      success: true,
      token: jwtToken,
      registrationId: sanitizedRegId,
    });
  } catch (error) {
    console.error("[TICKET_TOKEN] Error generating token:", error);
    return corsResponse(req, res, 500, {
      success: false,
      error: "Failed to generate ticket token"
    });
  }
}
