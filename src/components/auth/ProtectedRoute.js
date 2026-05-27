import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isTokenValid } from '../../utils/auth';
import Loading from '../common/Loading';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requiredScopes = [],
  validateContext = null,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, hasRole, hasPermission, loading, user, token, logout } = useAuth();
  const location = useLocation();

  // SECURITY: Distinguish between "never had a token" and "had a token that expired".
  // Passing sessionExpired lets the Login page show a contextual banner
  // instead of silently dropping the user on the login form.
  const sessionExpired = requireAuth && !loading && !isAuthenticated() && !!token && !isTokenValid(token);

  // Clean up stale session data cleanly via useEffect to avoid updating the
  // AuthProvider component's state during the ProtectedRoute render phase.
  useEffect(() => {
    if (sessionExpired) {
      logout();
    }
  }, [sessionExpired, logout]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loading text="Loading..." />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated()) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location, sessionExpired }}
      />
    );
  }

  // SECURITY: Check required roles against JWT token (server-signed, authoritative).
  // hasRole() verifies roles from the JWT, not localStorage, preventing privilege escalation.
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // SECURITY: Check required permissions against JWT claims.
  // Permissions must be verified server-side for critical operations.
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // SECURITY: Check fine-grained scopes from JWT token (server-signed).
  // Client-side scope validation is a UX optimization; server must validate for API calls.
  if (requiredScopes.length > 0) {
    const userScopes = user?.scopes || user?.scope?.split(' ') || [];
    const hasRequiredScope = requiredScopes.every(scope => userScopes.includes(scope));
    if (!hasRequiredScope) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // Dynamic context metadata/attributes validation
  if (validateContext && typeof validateContext === 'function') {
    const isContextValid = validateContext({ user, location });
    if (!isContextValid) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
