import { useMemo } from "react";
import { ROLES } from "../config/roles";

export function usePermissions(user) {
  const normalizedRoles = useMemo(() => {
    if (!user?.roles) return [];
    return user.roles.map((role) => {
      const normalized = String(role).toUpperCase();
      return normalized === "EVENT_MANAGER" ? ROLES.ORGANIZER : normalized;
    });
  }, [user?.roles]);

  const allPermissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  return useMemo(() => {
    const hasRole = (name) => normalizedRoles.includes(String(name).toUpperCase());
    const hasPermission = (perm) => allPermissions.includes(perm);
    const hasAnyRole = (...names) => names.some((r) => hasRole(r));
    const hasAnyPermission = (...perms) => perms.some((p) => hasPermission(p));

    return {
      normalizedRoles,
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
  }, [normalizedRoles, allPermissions]);
}
