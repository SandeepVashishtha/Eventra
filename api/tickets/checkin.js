import jwt from "jsonwebtoken";
import { verifyAuth } from "../middleware/auth.js";
import { registrations, scanLogs, checkInLocks } from "../db/store.js";
import { usersById } from "../auth/signup.js";
import { buildCorsHeaders, corsResponse } from "../auth/cors.js";
import { getJwtSecret } from "../auth/jwt-config.js";

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const user = req.user;

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

  let registrationId = ticketId;
  let decodedToken = null;

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

  // ATOMIC LOCK: prevent concurrent check-ins for the same registration
  if (checkInLocks.has(registrationId)) {
    return corsResponse(req, res, 409, { error: "Check-in already in progress for this ticket" });
  }
  checkInLocks.add(registrationId);

  try {
    let reg = registrations.get(registrationId);

    if (!reg && decodedToken) {
      const attendeeUser = usersById.get(decodedToken.userId) || {};
      reg = {
        registrationId,
        eventId: parseInt(eventId),
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
      const duplicateLog = {
        logId: crypto.randomUUID ? crypto.randomUUID() : log--,
        registrationId: reg.registrationId,
        eventId: reg.eventId,
        userId: reg.userId,
        userName: reg.userName,
        scannedBy: user.id,
        timestamp: new Date().toISOString(),
        status: "Duplicate Attempt"
      };
      scanLogs.push(duplicateLog);
      return corsResponse(req, res, 409, { error: "Attendee is already checked in" });
    }

    const checkedInAt = new Date().toISOString();
    reg.attendanceStatus = "Checked In";
    reg.checkedInAt = checkedInAt;
    reg.checkedInBy = user.id;

    const checkInLog = {
      logId: crypto.randomUUID ? crypto.randomUUID() : log--,
      registrationId: reg.registrationId,
      eventId: reg.eventId,
      userId: reg.userId,
      userName: reg.userName,
      scannedBy: user.id,
      timestamp: checkedInAt,
      status: "Checked In"
    };
    scanLogs.push(checkInLog);

    return corsResponse(req, res, 200, {
      success: true,
      message: "Attendee check-in recorded successfully",
      registration: reg
    });

  } finally {
    // Always release lock whether success or error
    checkInLocks.delete(registrationId);
  }
}

export default verifyAuth(handler);

