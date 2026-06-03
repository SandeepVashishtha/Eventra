import jwt from "jsonwebtoken";
import { verifyAuth } from "../middleware/auth.js";
import { registrations } from "../db/store.js";
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

  const { registrationId, eventId } = req.body;

  if (!registrationId || !eventId) {
    return corsResponse(req, res, 400, { error: "Missing required fields: registrationId and eventId" });
  }

  const user = req.user; // populated by verifyAuth middleware
  let reg = registrations.get(registrationId);

  // Backward compatibility check / Dynamic recovery:
  // If the registration is not in the serverless in-memory store yet (e.g. from an existing session
  // or created before a serverless cold start), dynamically seed it in the database.
  if (!reg) {
    reg = {
      registrationId,
      eventId: parseInt(eventId),
      userId: user.id,
      userName: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Attendee",
      email: user.email?.toLowerCase(),
      registeredAt: new Date().toISOString(),
      checkedInAt: null,
      checkedInBy: null,
      attendanceStatus: "Registered"
    };
    registrations.set(registrationId, reg);
  }

  // Ensure the requesting user owns the registration (or is an organizer/admin)
  const isOwner = reg.userId === user.id;
  const isOrganizer = (user.roles || []).some(role => 
    ["ORGANIZER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(role.toUpperCase())
  );

  if (!isOwner && !isOrganizer) {
    return corsResponse(req, res, 403, { error: "Forbidden: You are not authorized to view this ticket" });
  }

  try {
    // Generate secure signed JWT token containing registrationId and eventId
    // Do not include sensitive information like user name, email, or phone.
    const token = jwt.sign(
      { 
        registrationId: reg.registrationId, 
        eventId: reg.eventId 
      }, 
      getJwtSecret(), 
      { expiresIn: "7d" } // Secure signature
    );

    // Also update the stored registration's qrToken field
    reg.qrToken = token;

    return corsResponse(req, res, 200, {
      success: true,
      token,
      registrationId: reg.registrationId
    });
  } catch (error) {
    console.error("[Token Generation Error]:", error);
    return corsResponse(req, res, 500, { error: "Internal server error during token generation" });
  }
}

export default verifyAuth(handler);
