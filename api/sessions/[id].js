import {
  getAuthenticatedUserId,
  getCurrentSessionId,
  sendJson,
} from "../lib/authUtils.js";
import { revokeSession } from "../lib/sessionStore.js";

export default async function sessionByIdHandler(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return sendJson(res, 401, { message: "Authentication required." });
  }

  const { id } = req.query || {};
  const sessionId = Array.isArray(id) ? id[0] : id;

  if (!sessionId) {
    return sendJson(res, 400, { message: "Session id is required." });
  }

  if (req.method === "DELETE") {
    const currentSessionId = getCurrentSessionId(req);
    const result = revokeSession(sessionId, userId);

    if (!result.ok) {
      return sendJson(res, 404, { message: "Session not found." });
    }

    return sendJson(res, 200, {
      revoked: true,
      sessionId,
      revokedCurrentSession: sessionId === currentSessionId,
    });
  }

  res.setHeader("Allow", "DELETE");
  return sendJson(res, 405, { message: "Method not allowed." });
}
