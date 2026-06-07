import {
  getAuthenticatedUserId,
  getCurrentSessionId,
  parseBody,
  sendJson,
} from "../lib/authUtils.js";
import {
  createSession,
  getUserSessions,
  touchSession,
  cleanupExpiredSessions,
} from "../lib/sessionStore.js";

export default async function sessionsHandler(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return sendJson(res, 401, { message: "Authentication required." });
  }

  cleanupExpiredSessions();
  const currentSessionId = getCurrentSessionId(req);

  if (req.method === "GET") {
    const sessions = getUserSessions(userId, currentSessionId);
    return sendJson(res, 200, { sessions, currentSessionId });
  }

  if (req.method === "POST") {
    const body = (await parseBody(req)) || {};

    if (body.action === "heartbeat" && body.sessionId) {
      const updated = touchSession(body.sessionId);
      if (!updated || String(updated.userId) !== String(userId)) {
        return sendJson(res, 404, { message: "Session not found." });
      }
      return sendJson(res, 200, { session: { ...updated, isCurrent: true } });
    }

    const session = createSession(userId, {
      sessionId: body.sessionId,
      userAgent: body.userAgent,
      deviceFingerprint: body.deviceFingerprint,
      browser: body.browser,
      os: body.os,
      deviceType: body.deviceType,
      location: body.location,
    }, req);

    return sendJson(res, 201, {
      session: { ...session, isCurrent: true },
      notifyNewDevice: session.suspicious,
    });
  }

  res.setHeader("Allow", "GET, POST");
  return sendJson(res, 405, { message: "Method not allowed." });
}
