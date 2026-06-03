import jwt from "jsonwebtoken";
import { verifyAuth } from "../../middleware/auth.js";
import { registrations } from "../../db/store.js";
import { buildCorsHeaders, corsResponse } from "../../auth/cors.js";
import { getJwtSecret } from "../../auth/jwt-config.js";

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const { id } = req.query; // From Vercel dynamic routing [id]
  const eventId = parseInt(id);

  if (isNaN(eventId)) {
    return corsResponse(req, res, 400, { error: "Invalid eventId" });
  }

  const user = req.user; // Set by verifyAuth

  const { fullName, email, phone, organization, designation, additionalInfo } = req.body;

  // Validate inputs
  if (!fullName || !email) {
    return corsResponse(req, res, 400, { error: "Full name and email are required" });
  }

  // Check duplicate registration
  const existingReg = Array.from(registrations.values()).find(
    r => String(r.userId) === String(user.id) && parseInt(r.eventId) === eventId && r.attendanceStatus !== "Cancelled"
  );
  if (existingReg) {
    return corsResponse(req, res, 409, { error: "You are already registered for this event." });
  }

  const registrationId = crypto.randomUUID ? crypto.randomUUID() : `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const registeredAt = new Date().toISOString();

  // Create JWT ticket token containing registrationId, eventId, and userId
  const qrToken = jwt.sign(
    { 
      registrationId, 
      eventId, 
      userId: user.id 
    },
    getJwtSecret(),
    { expiresIn: "7d" } // Secure signed token
  );

  const newReg = {
    registrationId,
    eventId,
    userId: user.id,
    userName: fullName,
    email: email.toLowerCase(),
    phone,
    organization,
    designation,
    additionalInfo,
    registeredAt,
    checkedInAt: null,
    checkedInBy: null,
    attendanceStatus: "Registered",
    qrToken
  };

  registrations.set(registrationId, newReg);

  return corsResponse(req, res, 201, {
    message: "Registration successful",
    registrationId,
    qrToken,
    registration: newReg
  });
}

export default verifyAuth(handler);
