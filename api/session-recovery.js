import {
  getAuthenticatedUserId,
  getStore,
  isExpired,
  normalizeSession,
  parseBody,
  sendJson,
} from "./lib/sessionRecoveryStore.js";

export default async function sessionRecovery(req, res) {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    return sendJson(res, 401, { message: "Authentication required." });
  }

  const store = getStore();

  if (req.method === "GET") {
    const sessions = [...store.values()].filter(
      (session) => session.userId === userId && !isExpired(session),
    );
    return sendJson(res, 200, { sessions });
  }

  if (req.method === "POST") {
    const body = await parseBody(req);
    if (!body) return sendJson(res, 400, { message: "Invalid JSON body." });

    const session = normalizeSession(body, userId);
    if (!session) {
      return sendJson(res, 400, { message: "Invalid recovery session payload." });
    }

    store.set(session.sessionId, session);
    return sendJson(res, 201, session);
  }

  res.setHeader("Allow", "GET, POST");
  return sendJson(res, 405, { message: "Method not allowed." });
}
