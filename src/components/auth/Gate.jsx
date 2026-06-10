import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isTokenValid } from "../../utils/auth";
import Loading from "../common/Loading";

const Gate = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requiredScopes = [],
  permissionsMatch = "all",
  validateContext = null,
  redirectTo = "/login",
  fallback = null,
}) => {
  const { isAuthenticated, hasRole, hasPermission, loading, user, token, logout } = useAuth();
  const location = useLocation();

  const sessionExpired = requireAuth && !loading && !isAuthenticated() && !!token && !isTokenValid(token);

  useEffect(() => {
    if (sessionExpired) logout();
  }, [sessionExpired, logout]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated()) {
    if (fallback) return fallback;
    return <Navigate to={redirectTo} replace state={{ from: location, sessionExpired }} />;
  }

  const needsRedirect = !fallback || typeof fallback === "undefined";
  const deny = (reason) => {
    if (!needsRedirect) return fallback;
    if (!isAuthenticated()) return <Navigate to={redirectTo} replace state={{ from: location, sessionExpired }} />;
    return <Navigate to="/unauthorized" replace state={{ from: location, reason }} />;
  };

  if (requiredRoles.length > 0) {
    const ok = requiredRoles.some((role) => hasRole(role));
    if (!ok) return deny("role");
  }

  if (requiredPermissions.length > 0) {
    const ok = permissionsMatch === "all"
      ? requiredPermissions.every((p) => hasPermission(p))
      : requiredPermissions.some((p) => hasPermission(p));
    if (!ok) return deny("permission");
  }

  if (requiredScopes.length > 0) {
    const userScopes = user?.scopes || [];
    const ok = requiredScopes.every((scope) => userScopes.includes(scope));
    if (!ok) return deny("scope");
  }

  if (validateContext && typeof validateContext === "function") {
    const ok = validateContext({ user, location });
    if (!ok) return deny("context");
  }

  return children;
};

export default Gate;
