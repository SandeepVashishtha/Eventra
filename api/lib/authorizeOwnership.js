/**
 * Resource ownership authorization helpers.
 *
 * Prevents Insecure Direct Object Reference (IDOR) vulnerabilities by verifying
 * that the authenticated caller owns (or is otherwise permitted to access) the
 * resource identified by the request, before any data is returned or mutated.
 *
 * The registration endpoints previously returned and mutated records based on
 * the URL id alone, so any authenticated user could read or modify another
 * attendee's registration by guessing or incrementing the id. These helpers
 * centralise the ownership check so every endpoint enforces it consistently.
 */

/**
 * Determines whether a user may act on a resource.
 *
 * Access is granted when the user owns the resource or holds an elevated role
 * (admin / organizer). Comparison is type-tolerant so string and numeric ids
 * (e.g. "5001" vs 5001) match correctly.
 *
 * @param {Object} params
 * @param {string|number} params.userId - Authenticated user's id
 * @param {Array<string>} [params.userRoles] - Roles held by the user
 * @param {string|number} params.resourceOwnerId - Owner id stored on the resource
 * @param {Array<string>} [params.allowedRoles] - Roles that bypass ownership
 * @returns {boolean} true when access is permitted
 */
export function canAccessResource({
  userId,
  userRoles = [],
  resourceOwnerId,
  allowedRoles = ["admin", "organizer"],
}) {
  if (userId === undefined || userId === null) {
    return false;
  }
  if (resourceOwnerId === undefined || resourceOwnerId === null) {
    return false;
  }

  // Elevated roles may access any resource.
  if (Array.isArray(userRoles)) {
    for (const role of userRoles) {
      if (allowedRoles.includes(role)) {
        return true;
      }
    }
  }

  // Ownership check, tolerant of string vs numeric id types.
  return String(userId) === String(resourceOwnerId);
}

/**
 * Enforces ownership for a request, writing a 401/403 response when denied.
 *
 * @param {Object} params
 * @param {Object} params.user - Authenticated user ({ id, roles })
 * @param {Object} params.resource - Resource being accessed (must expose an owner id)
 * @param {string} [params.ownerField] - Field on the resource holding the owner id
 * @param {Array<string>} [params.allowedRoles] - Roles that bypass ownership
 * @param {Object} params.res - Response object exposing status()/json()
 * @returns {boolean} true when the caller may proceed, false when a response was sent
 */
export function enforceOwnership({
  user,
  resource,
  ownerField = "userId",
  allowedRoles = ["admin", "organizer"],
  res,
}) {
  if (!user || user.id === undefined || user.id === null) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  if (!resource) {
    res.status(404).json({ error: "Resource not found" });
    return false;
  }

  const allowed = canAccessResource({
    userId: user.id,
    userRoles: user.roles || [],
    resourceOwnerId: resource[ownerField],
    allowedRoles,
  });

  if (!allowed) {
    // 403, not 404: the resource exists but the caller is not permitted.
    // A deliberate uniform message avoids leaking which ids are valid.
    res.status(403).json({ error: "You do not have access to this resource" });
    return false;
  }

  return true;
}
