import {
  assertOwner,
  getAuthenticatedUserId,
  getStore,
  isExpired,
  normalizeSession,
  parseBody,
  sendJson,
} from "../lib/sessionRecoveryStore.js";
import { withAuth } from "../lib/authMiddleware.js";

const sessionRecoveryById = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  const { sessionId } = req.query || {};
  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const store = getStore();
  const existing = store.get(id);

  if (!assertOwner(existing, userId)) {
    return sendJson(res, 404, { message: "Recovery session not found." });
  }

  if (isExpired(existing)) {
    store.delete(id);
    return sendJson(res, 410, { message: "Recovery session expired." });
  }

  if (req.method === "GET") {
    return sendJson(res, 200, existing);
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    const body = await parseBody(req);
    if (!body) return sendJson(res, 400, { message: "Invalid JSON body." });

    const session = normalizeSession(
      {
        ...existing,
        ...body,
        sessionId: id,
        version: (existing.version || 1) + 1,
      },
      userId,
    );

    if (!session) {
      return sendJson(res, 400, { message: "Invalid recovery session payload." });
    }

    store.set(id, session);
    return sendJson(res, 200, session);
  }

  if (req.method === "DELETE") {
    store.delete(id);
    return sendJson(res, 200, { deleted: true });
  }

  res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
  return sendJson(res, 405, { message: "Method not allowed." });
};

export default withAuth(sessionRecoveryById);
