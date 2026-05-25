import React from 'react';
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
    // Distinguish between "never had a token" and "had a token that expired".
    // Passing sessionExpired lets the Login page show a contextual banner
    // instead of silently dropping the user on the login form.
    const sessionExpired = !!token && !isTokenValid(token);

    // Clean up stale session data so localStorage doesn't retain an
    // expired token that would confuse subsequent checks.
    if (sessionExpired) {
      logout();
    }

    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location, sessionExpired }}
      />
    );
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return <Navigate to="/unauthorized" replace state={{ from: location }} />;
    }
  }

  // Check fine-grained scopes
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
