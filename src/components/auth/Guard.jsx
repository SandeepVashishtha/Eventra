/**
 * Guard - Declarative Role-Based Access Control Component
 *
 * A flexible, reusable component for controlling UI visibility based on user roles and permissions.
 * Supports both singular and multiple role requirements with optional fallback UI.
 *
 * @example
 * // Single role requirement
 * <Guard requireRole="ADMIN">
 *   <AdminTools />
 * </Guard>
 *
 * @example
 * // Multiple roles (OR logic - any role matches)
 * <Guard requireRoles={["ADMIN", "ORGANIZER"]}>
 *   <ManagerPanel />
 * </Guard>
 *
 * @example
 * // With custom fallback
 * <Guard
 *   requireRoles={["ADMIN"]}
 *   fallback={<NotAuthorized />}
 * >
 *   <AdminContent />
 * </Guard>
 *
 * @example
 * // Multiple permission requirements (AND logic)
 * <Guard
 *   requirePermissions={["MANAGE_USERS", "VIEW_ANALYTICS"]}
 *   requirePermissionsMatch="all"
 * >
 *   <AnalyticsPanel />
 * </Guard>
 */

import { useAuth } from '../../context/AuthContext';

/**
 * Guard Component - Declarative RBAC wrapper
 *
 * @component
 * @param {Object} props
 * @param {string} [props.requireRole] - Single role to check (case-insensitive)
 * @param {string[]} [props.requireRoles] - Multiple roles to check (OR logic - any role matches)
 * @param {string[]} [props.requirePermissions] - Permissions to check
 * @param {string} [props.requirePermissionsMatch="any"] - "any" for OR logic, "all" for AND logic
 * @param {boolean} [props.requireAuth=true] - Whether authentication is required
 * @param {React.ReactNode} [props.fallback=null] - Fallback UI when access denied
 * @param {React.ReactNode} props.children - Content to display when access granted
 *
 * @returns {React.ReactNode} Either children or fallback, based on authorization
 *
 * @throws {Error} If useAuth is called outside AuthProvider
 *
 * @example
 * // Nested guards for complex scenarios
 * <Guard requireRoles={["ADMIN", "ORGANIZER"]}>
 *   <Guard requirePermissions={["MANAGE_USERS"]}>
 *     <CriticalAdminSection />
 *   </Guard>
 * </Guard>
 */
const Guard = ({
  requireRole = null,
  requireRoles = [],
  requirePermissions = [],
  requirePermissionsMatch = 'any',
  requireAuth = true,
  fallback = null,
  children,
}) => {
  const auth = useAuth();

  // Handle missing auth context (defensive)
  if (!auth) {
    console.warn('[Guard] Called outside AuthProvider context. Rendering fallback.');
    return fallback;
  }

  const {
    isAuthenticated,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
  } = auth;

  // 1. Check authentication requirement
  if (requireAuth && !isAuthenticated?.()) {
    return fallback;
  }

  // 2. Build combined roles array from singular and multiple props
  const rolesToCheck = [];
  if (requireRole) {
    rolesToCheck.push(requireRole);
  }
  if (Array.isArray(requireRoles) && requireRoles.length > 0) {
    rolesToCheck.push(...requireRoles);
  }

  // 3. Check roles (OR logic - user needs at least one role)
  if (rolesToCheck.length > 0) {
    const hasRequiredRole = hasAnyRole?.(...rolesToCheck);
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  // 4. Check permissions
  if (Array.isArray(requirePermissions) && requirePermissions.length > 0) {
    const permissionMatch =
      requirePermissionsMatch === 'all'
        ? requirePermissions.every((permission) => hasPermission?.(permission))
        : hasAnyPermission?.(...requirePermissions);

    if (!permissionMatch) {
      return fallback;
    }
  }

  // 5. All checks passed - render children
  return children;
};

export default Guard;
