/**
 * Registration detail endpoint (GET / PUT / DELETE) with IDOR protection.
 *
 * Previously these operations trusted the URL id alone, so any authenticated
 * user could read or modify another attendee's registration by guessing or
 * incrementing the id, exposing phone, email and address. This handler verifies
 * that the caller owns the registration (or holds an organizer/admin role)
 * before returning or mutating any data.
 */

import { enforceOwnership } from "../lib/authorizeOwnership.js";

/**
 * Registration handler.
 *
 * @param {Object} req - Request with method, body, and an authenticated user
 * @param {Object} res - Response exposing status()/json()
 * @param {Object} [deps] - Injected dependencies for testability
 * @param {Function} [deps.getRegistrationById] - async (id) => registration | null
 * @param {Function} [deps.updateRegistration] - async (id, patch) => registration
 * @param {Function} [deps.deleteRegistration] - async (id) => void
 * @param {Function} [deps.getRegistrationId] - (req) => string (id extraction)
 */
export default async function registrationHandler(req, res, deps = {}) {
  const {
    getRegistrationById,
    updateRegistration,
    deleteRegistration,
    getRegistrationId = (request) =>
      request.params?.id ?? request.query?.id,
  } = deps;

  // The caller must be authenticated. In production this is populated by the
  // auth middleware; tests inject it directly.
  const user = req.user;
  if (!user || user.id === undefined || user.id === null) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const registrationId = getRegistrationId(req);
  if (!registrationId) {
    res.status(400).json({ error: "Registration id is required" });
    return;
  }

  if (typeof getRegistrationById !== "function") {
    res.status(503).json({ error: "Registration service unavailable" });
    return;
  }

  let registration;
  try {
    registration = await getRegistrationById(registrationId);
  } catch {
    res.status(500).json({ error: "Internal server error" });
    return;
  }

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  // Core IDOR guard: verify ownership before any read or write.
  if (!enforceOwnership({ user, resource: registration, ownerField: "userId", res })) {
    return;
  }

  const method = req.method || "GET";

  try {
    if (method === "GET") {
      res.status(200).json({ registration });
      return;
    }

    if (method === "PUT" || method === "PATCH") {
      if (typeof updateRegistration !== "function") {
        res.status(503).json({ error: "Registration service unavailable" });
        return;
      }
      // Never allow the owner id to be reassigned through an update.
      const patch = { ...(req.body || {}) };
      delete patch.userId;
      delete patch.id;

      const updated = await updateRegistration(registrationId, patch);
      res.status(200).json({ registration: updated });
      return;
    }

    if (method === "DELETE") {
      if (typeof deleteRegistration !== "function") {
        res.status(503).json({ error: "Registration service unavailable" });
        return;
      }
      await deleteRegistration(registrationId);
      res.status(204).json({});
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
