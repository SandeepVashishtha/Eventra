import {
  getAuthenticatedUserId,
  getCurrentSessionId,
  sendJson,
} from "../lib/authUtils.js";
import { revokeAllSessions } from "../lib/sessionStore.js";

export default async function logoutAllHandler(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return sendJson(res, 401, { message: "Authentication required." });
  }

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  const currentSessionId = getCurrentSessionId(req);
  const { revokedCount } = revokeAllSessions(userId, currentSessionId);

  return sendJson(res, 200, {
    revoked: true,
    revokedCount,
    keptCurrentSession: Boolean(currentSessionId),
  });
}
