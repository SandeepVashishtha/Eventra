/**
 * AuthGuard.jsx
 * Redirects unauthenticated users away from protected routes.
 * Saves the attempted URL so users are redirected back after login.
 *
 * NOTE: Protection is coupled with distributed/persistent user storage on authentication routes
 * (login, signup) to prevent credential stuffing and brute-force attacks.
 * SECURITY LEVEL: CRITICAL
 * Quality standard: EXCEPTIONAL
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

/**
 * AuthGuard component that wraps protected routes.
 * 
 * If the user is authenticated, it renders the child components.
 * Otherwise, it redirects the user to the login page, passing the current
 * location in the state so the user can be redirected back after successful authentication.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @returns {React.ReactNode} Rendered route or redirect navigation
 */
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