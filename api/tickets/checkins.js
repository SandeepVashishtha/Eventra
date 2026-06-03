import { verifyAuth } from "../middleware/auth.js";
import { scanLogs } from "../db/store.js";
import { buildCorsHeaders, corsResponse } from "../auth/cors.js";
import { isAuthorizedForEvent } from "../lib/permissions.js";

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
    return corsResponse(req, res, 403, { error: "Forbidden: Only organizers can access check-in history" });
  }

  const { eventId } = req.query;

  let filtered = scanLogs;
  if (eventId) {
    // Issue #6345: Verify ownership if a specific eventId is requested
    if (!isAuthorizedForEvent(user, eventId)) {
      return corsResponse(req, res, 403, { error: "Forbidden: You are not authorized to view check-ins for this event" });
    }
    filtered = scanLogs.filter(log => String(log.eventId) === String(eventId));
  } else {
    // Issue #6345: If no eventId is provided, only return logs for events the user owns
    filtered = scanLogs.filter(log => isAuthorizedForEvent(user, log.eventId));
  }

  // Map scan logs to UI structure expected by TicketScanner
  const history = filtered.map(log => ({
    id: log.logId,
    ticketId: log.registrationId,
    name: log.userName,
    event: log.eventName || `Event #${log.eventId}`,
    status: log.status === "Checked In" ? "Verified" : "Flagged",
    time: log.timestamp // Send timestamp, frontend maps to visual format or relative text
  }));

  // Return the history list (most recent first)
  const sortedHistory = history.reverse();

  return corsResponse(req, res, 200, sortedHistory);
}

export default verifyAuth(handler);
