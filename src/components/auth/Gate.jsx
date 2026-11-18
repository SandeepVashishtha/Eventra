import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { isAuthSessionValid } from "utils/auth";
import Loading from "../common/Loading";

/**
 * Gate — route-level authentication and authorization guard.
 *
 * Fix for issue #16524:
 * Previously, isAuthenticated() was called during render and internally
 * called clearExpiredSession(), which mutated AuthProvider state mid-render.
 * This caused React's "Cannot update a component (AuthProvider) while
 * rendering a different component (Gate)" warning.
 *
 * Fix: isAuthenticated() is now a pure predicate (no side effects).
 * Session cleanup is triggered in a useEffect so it runs after render,
 * keeping the render phase side-effect-free.
 */
const Gate = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  requiredScopes = [],
  permissionsMatch = "all",
  validateContext = null,
  redirectTo = "/login",
  fallback = undefined,
}) => {
  const { isAuthenticated, clearExpiredSession, hasRole, hasPermission, loading, user, token } = useAuth();
  const location = useLocation();

  // Compute auth status as a plain boolean during render — no side effects.
  const authenticated = !loading && isAuthenticated();

  // Detect an expired-token scenario: had a token but isAuthenticated() returned false.
  const sessionExpired = requireAuth && !loading && !authenticated && !!token && !isAuthSessionValid(token);

  // Move all side effects (session cleanup) out of render and into useEffect.
  // This prevents the React "Cannot update during render" warning (#16524).
  useEffect(() => {
    if (sessionExpired) {
      clearExpiredSession();
    }
  }, [sessionExpired, clearExpiredSession]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-black">
        <Loading text="Loading..." />
      </div>
    );
  }

  if (requireAuth && !authenticated) {
    // If session just expired, return null while useEffect above triggers the
    // redirect — avoids flashing the Navigate component before clearExpiredSession
    // runs its window.location.replace("/login").
    if (sessionExpired) return null;
    if (fallback) return fallback;
    return <Navigate to={redirectTo} replace state={{ from: location, sessionExpired }} />;
  }

  const needsRedirect = typeof fallback === "undefined";
  const deny = (reason) => {
    if (!needsRedirect) return fallback;
    if (!authenticated) return <Navigate to={redirectTo} replace state={{ from: location, sessionExpired }} />;
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
