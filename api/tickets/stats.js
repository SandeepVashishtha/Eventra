import { verifyAuth } from "../middleware/auth.js";
import { registrations } from "../db/store.js";
import { buildCorsHeaders, corsResponse } from "../auth/cors.js";

async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).set(buildCorsHeaders(req)).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return corsResponse(req, res, 405, { error: "Method not allowed" });
  }

  const user = req.user;

  // Ensure authorized access
  const isOrganizer = (user.roles || []).some(role => 
    ["ORGANIZER", "ADMIN", "SUPER_ADMIN", "EVENT_MANAGER"].includes(role.toUpperCase())
  );
  if (!isOrganizer) {
    return corsResponse(req, res, 403, { error: "Forbidden: Access denied" });
  }

  const { eventId } = req.query;

  if (!eventId) {
    return corsResponse(req, res, 400, { error: "Missing required parameter: eventId" });
  }

  // Fetch registrations from database matching eventId and not cancelled
  const eventRegs = Array.from(registrations.values()).filter(
    r => String(r.eventId) === String(eventId) && r.attendanceStatus !== "Cancelled"
  );

  const totalRegistrations = eventRegs.length;
  const checkedInAttendees = eventRegs.filter(r => r.attendanceStatus === "Checked In").length;
  const remainingAttendees = totalRegistrations - checkedInAttendees;
  const attendancePercentage = totalRegistrations > 0 
    ? Math.round((checkedInAttendees / totalRegistrations) * 100) 
    : 0;

  return corsResponse(req, res, 200, {
    totalRegistrations,
    checkedInAttendees,
    attendancePercentage,
    remainingAttendees
  });
}

export default verifyAuth(handler);
