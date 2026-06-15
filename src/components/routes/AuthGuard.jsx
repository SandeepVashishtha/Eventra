/**
 * AuthGuard.jsx
 * Redirects unauthenticated users away from protected routes.
 * Saves the attempted URL so users are redirected back after login.
 */

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PROTECTED_PATHS = [
  "/dashboard",
  "/settings",
  "/profile",
  "/create-event",
  "/bookmarks",
  "/reminders",
];

export const isProtectedPath = (pathname) => {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
};

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
};

export default AuthGuard;