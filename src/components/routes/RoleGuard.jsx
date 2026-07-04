/**
 * RoleGuard.jsx
 * Protects routes from unauthorized access via direct URL manipulation.
 * Enforces role-based access control on all protected routes.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RoleGuard = ({
  children,
  allowedRoles = [],
  redirectTo = "/",
  requireAuth = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const authenticated = isAuthenticated();

  // Not logged in
  if (requireAuth && !authenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // No role restriction — just auth required
  if (allowedRoles.length === 0) {
    return children;
  }

  const userRoles = user?.roles || (user?.role ? [user.role] : []);
  const hasRole = allowedRoles.some((role) =>
    userRoles.map((r) => r.toLowerCase()).includes(role.toLowerCase())
  );

  if (!hasRole) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export const AdminGuard = ({ children }) => (
  <RoleGuard allowedRoles={["ADMIN", "admin"]} redirectTo="/dashboard">
    {children}
  </RoleGuard>
);

export const OrganizerGuard = ({ children }) => (
  <RoleGuard allowedRoles={["ADMIN", "admin", "ORGANIZER", "organizer"]} redirectTo="/dashboard">
    {children}
  </RoleGuard>
);

export default RoleGuard;