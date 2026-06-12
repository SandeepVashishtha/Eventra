/**
 * CanAccess - Backward Compatible RBAC Component
 *
 * Enhanced wrapper around Guard that maintains the original CanAccess API
 * while supporting new Guard features. This component is a drop-in replacement
 * for the original CanAccess with additional capabilities.
 *
 * @deprecated Consider using Guard directly for new code (less abstraction)
 * @see Guard for more flexible role-based access control
 *
 * @example
 * // Original API (still works)
 * <CanAccess roles={["ADMIN", "ORGANIZER"]}>
 *   <AdminPanel />
 * </CanAccess>
 *
 * @example
 * // With permissions
 * <CanAccess
 *   roles={["ADMIN"]}
 *   permissions={["MANAGE_USERS"]}
 *   fallback={<NotAuthorized />}
 * >
 *   <UserManagement />
 * </CanAccess>
 */

import Guard from "./Guard";

/**
 * CanAccess - Backward Compatible Access Control Component
 *
 * A convenience wrapper around Guard that uses the original property names
 * for backward compatibility. All new code should prefer using Guard directly.
 *
 * @component
 * @param {Object} props
 * @param {string[]} [props.roles=[]] - Roles the user must have (OR logic)
 * @param {string[]} [props.permissions=[]] - Permissions to check (default: OR logic)
 * @param {string} [props.permissionsMatch="any"] - "any" for OR, "all" for AND
 * @param {React.ReactNode} [props.fallback=null] - Fallback UI if access denied
 * @param {React.ReactNode} props.children - Content to display if authorized
 *
 * @returns {React.ReactNode} Either children or fallback
 *
 * @example
 * <CanAccess
 *   roles={["ADMIN", "ORGANIZER"]}
 *   permissions={["CREATE_EVENT"]}
 *   fallback={<AccessDenied />}
 * >
 *   <EventCreationForm />
 * </CanAccess>
 */
const CanAccess = ({
  roles = [],
  permissions = [],
  permissionsMatch = "any",
  fallback = null,
  children,
}) => {
  return (
    <Guard
      requireRoles={roles}
      requirePermissions={permissions}
      requirePermissionsMatch={permissionsMatch}
      fallback={fallback}
    >
      {children}
    </Guard>
  );
};

export default CanAccess;
