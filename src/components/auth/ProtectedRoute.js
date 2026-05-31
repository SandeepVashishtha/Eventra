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

  // 🔥 SECURITY FIX: Calculate true token expiration independent of stale React context state.
  // This prevents expired tokens from bypassing the gatekeeper if isAuthenticated() hasn't updated yet.
  const isTokenExpired = !!token && !isTokenValid(token);
  
  // sessionExpired now properly flags if the token died, even if the context still thinks they are logged in.
  const sessionExpired = requireAuth && !loading && isTokenExpired;

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

  // 🔥 SECURITY FIX: Actively block the route if the context says they are logged out OR the token mathematically expired.
  if (requireAuth && (!isAuthenticated() || sessionExpired)) {
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