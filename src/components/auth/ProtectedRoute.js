import { useEffect } from 'react';
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
  const {
    isAuthenticated,
    hasRole,
    hasPermission,
    loading,
    user,
    token,
    sessionExpired,
    clearExpiredSession,
  } = useAuth();
  const location = useLocation();

  const tokenExpired =
    requireAuth &&
    !loading &&
    !!token &&
    token !== 'cookie-managed' &&
    !isTokenValid(token);

  const shouldRedirectForExpiry = sessionExpired || tokenExpired;

  useEffect(() => {
    if (shouldRedirectForExpiry && (user || token)) {
      clearExpiredSession();
    }
  }, [shouldRedirectForExpiry, user, token, clearExpiredSession]);

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
        state={{ from: location, sessionExpired: shouldRedirectForExpiry }}
      />
    );
  }

  // If the user is not authenticated, send them to login regardless of which
  // downstream check fails. This handles the edge case where isAuthenticated()
  // returns true (e.g. stale session data) but role/permission checks still fail
  // for an unauthenticated user — we redirect to /login instead of /unauthorized.
  const redirectIfUnauthenticated = () => {
    if (!isAuthenticated()) {
      return (
        <Navigate
          to={redirectTo}
          replace
          state={{ from: location, sessionExpired: shouldRedirectForExpiry }}
        />
      );
    }
    return null;
  };

  // SECURITY: Check required roles against JWT token (server-signed, authoritative).
  // hasRole() verifies roles from the JWT, not localStorage, preventing privilege escalation.
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      const authRedirect = redirectIfUnauthenticated();
      if (authRedirect) return authRedirect;
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // SECURITY: Check required permissions against JWT claims.
  // Permissions must be verified server-side for critical operations.
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.every(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      const authRedirect = redirectIfUnauthenticated();
      if (authRedirect) return authRedirect;
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // SECURITY: Check fine-grained scopes from JWT token (server-signed).
  // Client-side scope validation is a UX optimization; server must validate for API calls.
  if (requiredScopes.length > 0) {
    const userScopes = user?.scopes || user?.scope?.split(' ') || [];
    const hasRequiredScope = requiredScopes.every(scope => userScopes.includes(scope));
    if (!hasRequiredScope) {
      const authRedirect = redirectIfUnauthenticated();
      if (authRedirect) return authRedirect;
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // Dynamic context metadata/attributes validation
  if (validateContext && typeof validateContext === 'function') {
    const isContextValid = validateContext({ user, location });
    if (!isContextValid) {
      const authRedirect = redirectIfUnauthenticated();
      if (authRedirect) return authRedirect;
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  return children;
};

export default ProtectedRoute;
