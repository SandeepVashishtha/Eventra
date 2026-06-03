import jwt from "jsonwebtoken";
import { verifyAuth } from "../middleware/auth.js";
import { registrations, scanLogs } from "../db/store.js";
import { usersById } from "../auth/signup.js";
import { buildCorsHeaders, corsResponse } from "../auth/cors.js";
import { getJwtSecret } from "../auth/jwt-config.js";
import { isAuthorizedForEvent } from "../lib/permissions.js";

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const user = req.user; // Organizer

  // Ensure only authorized organizers/admins can check in attendees
  const isOrganizer = (user.roles || []).some(role => 
    ["ORGANIZER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(role.toUpperCase())
  );
  if (!isOrganizer) {
    return corsResponse(req, res, 403, { error: "Forbidden: Only organizers can check in attendees" });
  }

  const { ticketId, eventId } = req.body;

  if (!ticketId || !eventId) {
    return corsResponse(req, res, 400, { error: "Missing ticketId or eventId in request body" });
  }

  // Issue #6343: Verify that this organizer actually owns this eventId
  if (!isAuthorizedForEvent(user, eventId)) {
    return corsResponse(req, res, 403, { error: "Forbidden: You are not authorized to manage this event" });
  }

  let registrationId = ticketId;
  let decodedToken = null;

  // Check if ticketId is a JWT token
  if (ticketId.startsWith("eyJ")) {
    try {
      decodedToken = jwt.verify(ticketId, getJwtSecret());
      registrationId = decodedToken.registrationId;

      if (parseInt(decodedToken.eventId) !== parseInt(eventId)) {
        return corsResponse(req, res, 400, { error: "Ticket is for a different event" });
      }
    } catch (err) {
      return corsResponse(req, res, 400, { error: "Invalid, expired, or tampered ticket QR code" });
    }
  }

  let reg = registrations.get(registrationId);

  // Recover registration if it is valid but missing from process memory
  if (!reg && decodedToken) {
    const attendeeUser = usersById.get(decodedToken.userId) || {};
    reg = {
      registrationId,
      eventId: parseInt(decodedToken.eventId),
      userId: decodedToken.userId || "unknown",
      userName: attendeeUser.fullName || `${attendeeUser.firstName || ""} ${attendeeUser.lastName || ""}`.trim() || "Attendee",
      email: attendeeUser.email || "guest@eventra.com",
      registeredAt: new Date().toISOString(),
      checkedInAt: null,
      checkedInBy: null,
      attendanceStatus: "Registered",
      qrToken: ticketId
    };
    registrations.set(registrationId, reg);
  }

  if (!reg) {
    return corsResponse(req, res, 404, { error: "Ticket registration not found" });
  }

  if (parseInt(reg.eventId) !== parseInt(eventId)) {
    return corsResponse(req, res, 400, { error: "Ticket is for a different event" });
  }

  if (reg.attendanceStatus === "Cancelled") {
    return corsResponse(req, res, 400, { error: "Registration is cancelled" });
  }

  if (reg.attendanceStatus === "Checked In") {
    // Log duplicate attempt for auditing
    const duplicateLog = {
      logId: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      registrationId: reg.registrationId,
      eventId: reg.eventId,
      userId: reg.userId,
      userName: reg.userName,
      scannedBy: user.id,
      timestamp: new Date().toISOString(),
      status: "Duplicate Attempt"
    };
    scanLogs.push(duplicateLog);
    if (scanLogs.length > 10000) scanLogs.shift();

    return corsResponse(req, res, 409, { error: "Attendee is already checked in" });
  }

  // Record check-in status, timestamp, and organizer identifier
  const checkedInAt = new Date().toISOString();
  reg.attendanceStatus = "Checked In";
  reg.checkedInAt = checkedInAt;
  reg.checkedInBy = user.id;

  // Log successful check-in for auditing/history
  const checkInLog = {
    logId: crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    registrationId: reg.registrationId,
    eventId: reg.eventId,
    userId: reg.userId,
    userName: reg.userName,
    scannedBy: user.id,
    timestamp: checkedInAt,
    status: "Checked In"
  };
  scanLogs.push(checkInLog);
  if (scanLogs.length > 10000) scanLogs.shift();

  return corsResponse(req, res, 200, {
    success: true,
    message: "Attendee check-in recorded successfully",
    registration: reg
  });
}

export default verifyAuth(handler);
