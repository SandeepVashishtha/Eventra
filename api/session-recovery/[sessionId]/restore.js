import {
  assertOwner,
  getAuthenticatedUserId,
  getStore,
  isExpired,
  sendJson,
} from "../../lib/sessionRecoveryStore.js";
import { withAuth } from "../../lib/authMiddleware.js";

const restoreSessionRecovery = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  const { sessionId } = req.query || {};
  const id = Array.isArray(sessionId) ? sessionId[0] : sessionId;
  const store = getStore();
  const session = store.get(id);

  if (!assertOwner(session, userId)) {
    return sendJson(res, 404, { message: "Recovery session not found." });
  }

  if (isExpired(session)) {
    store.delete(id);
    return sendJson(res, 410, { message: "Recovery session expired." });
  }

  return sendJson(res, 200, { session });
};

export default withAuth(restoreSessionRecovery);
