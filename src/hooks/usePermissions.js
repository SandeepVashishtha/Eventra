/**
 * @fileoverview usePermissions hook
 * @module hooks/usePermissions
 * 
 * Provides authorization helper utilities (such as hasRole, hasPermission, etc.)
 * derived from the authenticated user's profile.
 * 
 * Design Principles:
 * 1. Pure Hooks: This hook does not query the AuthContext directly to prevent circular dependency
 *    issues since the AuthContext provider uses this hook to build its value.
 * 2. Immutable Outputs: Results are heavily memoized using React's useMemo to ensure
 *    reference-stable callback references and avoid component re-render cascades.
 * 3. Fallback Resilience: Gracefully handles null/undefined user states by returning falsy outputs.
 */

import { useMemo } from "react";
import { ROLES } from "../config/roles.js";

/**
 * Normalizes user roles into a clean uppercase array format.
 * Maps legacy role names (such as "EVENT_MANAGER") to the canonical roles (such as "ORGANIZER").
 * 
 * @param {Array|string} roles - Raw roles list or single role string from user session.
 * @returns {string[]} Normalized uppercase roles list.
 */
export const normalizeRoles = (roles = []) => {
  const rawList = Array.isArray(roles) ? roles : [roles];
  
  return rawList
    .filter((r) => r !== null && r !== undefined)
    .map((role) => {
      const normalized = String(role).trim().toUpperCase();
      // Legacy normalization mapping: EVENT_MANAGER maps to ORGANIZER
      if (normalized === "EVENT_MANAGER") {
        return ROLES.ORGANIZER;
      }
      return normalized;
    });
};

/**
 * Custom React hook that derives granular permission verification helpers from the user profile.
 * 
 * @param {Object|null} user - The authenticated user object containing roles and permission lists.
 * @returns {Object} A collection of authorization states and query functions.
 */
export function usePermissions(user) {
  // 1. Normalize and memoize roles list
  const normalizedRoles = useMemo(() => {
    if (!user || !user.roles) {
      return [];
    }
    return normalizeRoles(user.roles);
  }, [user]);

  // 2. Extract and memoize explicit permissions
  const allPermissions = useMemo(() => {
    if (!user || !user.permissions) {
      return [];
    }
    return Array.isArray(user.permissions)
      ? user.permissions.map((p) => String(p))
      : [String(user.permissions)];
  }, [user]);

  // 3. Compile and memoize final helper utility functions
  return useMemo(() => {
    /**
     * Checks if the user is assigned a specific role.
     * 
     * @param {string} name - The role name (case-insensitive).
     * @returns {boolean} True if the user has the role.
     */
    const hasRole = (name) => {
      if (!name) return false;
      return normalizedRoles.includes(String(name).toUpperCase());
    };

    /**
     * Checks if the user possesses an explicit permission.
     * 
     * @param {string} perm - The permission identifier (e.g. 'event:write').
     * @returns {boolean} True if the user has the permission.
     */
    const hasPermission = (perm) => {
      if (!perm) return false;
      return allPermissions.includes(String(perm));
    };

    /**
     * Checks if the user has at least one of the specified roles.
     * 
     * @param {...string} names - List of role names to check.
     * @returns {boolean} True if any role matches.
     */
    const hasAnyRole = (...names) => {
      if (names.length === 0) return false;
      return names.some((r) => hasRole(r));
    };

    /**
     * Checks if the user has at least one of the specified permissions.
     * 
     * @param {...string} perms - List of permission keys to check.
     * @returns {boolean} True if any permission matches.
     */
    const hasAnyPermission = (...perms) => {
      if (perms.length === 0) return false;
      return perms.some((p) => hasPermission(p));
    };

    // 4. Resolve standard scopes associated with the user
    const getScopes = () => {
      if (user?.scopes) return user.scopes;
      if (hasAnyRole(ROLES.SUPER_ADMIN, ROLES.ADMIN)) {
        return ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"];
      }
      if (hasRole(ROLES.ORGANIZER)) {
        return ["event:write", "event:read", "hackathon:write", "hackathon:read"];
      }
      return ["event:read", "hackathon:read"];
    };

    const scopes = getScopes();

    // Return final authorization model
    return {
      normalizedRoles,
      scopes,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAnyPermission,
      isAdmin: () => hasRole(ROLES.ADMIN),
      isEventManager: () => hasRole(ROLES.ORGANIZER),
      isSuperAdmin: () => hasRole(ROLES.SUPER_ADMIN),
      isOrganizer: () => hasRole(ROLES.ORGANIZER),
      isVolunteer: () => hasRole(ROLES.VOLUNTEER),
      isAttendee: () => hasRole(ROLES.ATTENDEE),
    };
  }, [normalizedRoles, allPermissions, user]);
}
