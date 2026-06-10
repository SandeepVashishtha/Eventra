import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { ROLES, ROLE_PERMISSIONS } from "../config/roles";

export const normalizeRoles = (roles = []) => {
  return roles.map((role) => {
    const normalized = String(role).toUpperCase();
    return normalized === "EVENT_MANAGER" ? ROLES.ORGANIZER : normalized;
  });
};

export const usePermissions = () => {
  const { user, hasRole, hasPermission } = useAuth();

  const hasAnyRole = useCallback(
    (...roleNames) => roleNames.some((role) => hasRole(role)),
    [hasRole],
  );

  const hasAnyPermission = useCallback(
    (...permissionNames) => permissionNames.some((permission) => hasPermission(permission)),
    [hasPermission],
  );

  const isAdmin = useCallback(() => hasRole(ROLES.ADMIN), [hasRole]);
  const isEventManager = useCallback(() => hasRole(ROLES.ORGANIZER), [hasRole]);
  const isSuperAdmin = useCallback(() => hasRole(ROLES.SUPER_ADMIN), [hasRole]);
  const isOrganizer = useCallback(() => hasRole(ROLES.ORGANIZER), [hasRole]);
  const isVolunteer = useCallback(() => hasRole(ROLES.VOLUNTEER), [hasRole]);
  const isAttendee = useCallback(() => hasRole(ROLES.ATTENDEE), [hasRole]);

  const scopes = useMemo(() => {
    if (user?.scopes) return user.scopes;
    if (!user?.roles) return [];
    const resolved = normalizeRoles(user.roles);
    if (resolved.includes(ROLES.SUPER_ADMIN) || resolved.includes(ROLES.ADMIN)) {
      return ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"];
    }
    if (resolved.includes(ROLES.ORGANIZER)) {
      return ["event:write", "event:read", "hackathon:write", "hackathon:read"];
    }
    return ["event:read", "hackathon:read"];
  }, [user]);

  return {
    hasAnyRole,
    hasAnyPermission,
    hasRole,
    hasPermission,
    isAdmin,
    isEventManager,
    isSuperAdmin,
    isOrganizer,
    isVolunteer,
    isAttendee,
    scopes,
  };
};
