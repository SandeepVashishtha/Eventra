import jwt from "jsonwebtoken";
import { verifyAuth } from "../middleware/auth.js";
import { registrations, scanLogs } from "../db/store.js";
import { usersById } from "../auth/signup.js";
import { buildCorsHeaders, corsResponse } from "../auth/cors.js";
import { getJwtSecret } from "../auth/jwt-config.js";

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

  // Ensure only authorized organizers/admins can access scanning functionality
  const isOrganizer = (user.roles || []).some(role => 
    ["ORGANIZER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(role.toUpperCase())
  );
  if (!isOrganizer) {
    return corsResponse(req, res, 403, { error: "Forbidden: Only organizers can scan tickets" });
  }

  const { ticketId, eventId } = req.body;

  if (!ticketId || !eventId) {
    return corsResponse(req, res, 400, { error: "Missing ticketId or eventId in request body" });
  }

  let registrationId = ticketId;
  let decodedToken = null;

  // Check if ticketId is a JWT token (secure signed token)
  if (ticketId.startsWith("eyJ")) {
    try {
      decodedToken = jwt.verify(ticketId, getJwtSecret());
      registrationId = decodedToken.registrationId;

      // Security Check: Verify eventId in token matches request eventId
      if (parseInt(decodedToken.eventId) !== parseInt(eventId)) {
        return corsResponse(req, res, 400, {
          valid: false,
          message: "Security Alert: Ticket is valid, but registered for a different event."
        });
      }
    } catch (err) {
      return corsResponse(req, res, 400, {
        valid: false,
        message: "Security Alert: QR Code is invalid, expired, or has been tampered with!"
      });
    }
  }

  let reg = registrations.get(registrationId);

  // If registration is not in memory but token is authentic (verified JWT), recover it
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
    return corsResponse(req, res, 404, {
      valid: false,
      message: "Ticket registration not found. Please verify details."
    });
  }

  // Verify event matches
  if (parseInt(reg.eventId) !== parseInt(eventId)) {
    return corsResponse(req, res, 400, {
      valid: false,
      message: "Ticket is valid, but registered for a different event."
    });
  }

  // Check if registration was cancelled
  if (reg.attendanceStatus === "Cancelled") {
    return corsResponse(req, res, 400, {
      valid: false,
      message: "This registration has been cancelled."
    });
  }

  // Check duplicate check-in
  if (reg.attendanceStatus === "Checked In") {
    // Log duplicate scan attempt for auditing
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

    return corsResponse(req, res, 200, {
      valid: true,
      alreadyCheckedIn: true,
      registrationId: reg.registrationId,
      userName: reg.userName,
      email: reg.email,
      eventId: reg.eventId,
      message: "This ticket has already been checked in!"
    });
  }

  // Return successful validation details (without checking in yet — that's handled by recordCheckIn)
  return corsResponse(req, res, 200, {
    valid: true,
    alreadyCheckedIn: false,
    registrationId: reg.registrationId,
    userName: reg.userName,
    email: reg.email,
    eventId: reg.eventId,
    attendanceStatus: reg.attendanceStatus,
    message: "Ticket verified successfully."
  });
}

export default verifyAuth(handler);
