import {
  getAuthenticatedUserId,
  getStore,
  isExpired,
  sendJson,
} from "../lib/sessionRecoveryStore.js";
import { withAuth } from "../lib/authMiddleware.js";

const cleanupExpiredRecovery = async (req, res) => {
  const userId = getAuthenticatedUserId(req);

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return sendJson(res, 405, { message: "Method not allowed." });
  }

  const store = getStore();
  let deleted = 0;

  for (const [sessionId, session] of store.entries()) {
    if (session.userId === userId && isExpired(session)) {
      store.delete(sessionId);
      deleted += 1;
    }
  }

  return sendJson(res, 200, { deleted });
};

export default withAuth(cleanupExpiredRecovery);
