import { createContext, useContext, useEffect, useMemo, useCallback, useRef, useState } from "react";
import { setOnUnauthorizedHandler, setRequiresReauthHandler, setAuthToken, setRefreshToken, apiUtils } from "../config/api.js";
import { authService } from "../services/authService.js";
import { syncSecureStorage } from "../utils/secureStorage.js";
import { clearWaitlistCache } from "../utils/waitlistUtils.js";
import { usePermissions, normalizeRoles } from "../hooks/usePermissions.js";
import { useTokenExpiry } from "../hooks/useTokenExpiry.js";
import { isTokenValid } from "../utils/tokenUtils.js";
import { toast } from "react-toastify";
import { ROLES, ROLE_PERMISSIONS } from "../config/roles.js";
import { getSessionChannel, closeSessionChannel, SESSION_TERMINATED, broadcastSessionTerminated } from "../utils/sessionBroadcast.js";
import { deleteCookie } from "../utils/cookieUtils.js";
import ReAuthModal from "../components/auth/ReAuthModal";

// Create context for Authentication
const AuthContext = createContext();

/**
 * Custom hook to consume the AuthContext.
 * Ensures that it is only used within a valid AuthProvider.
 * 
 * @returns {Object} Authentication context state and helper functions.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Development-only backdoor for storybook/testing. Never active in production.
  if (
    import.meta.env?.DEV &&
    typeof globalThis !== "undefined" &&
    typeof globalThis.mockAuth === "function"
  ) {
    const mock = globalThis.mockAuth();
    // Even in development, the forged session is validated against the real
    // permission model so the test seam resolves roles/permissions exactly like
    // a production session instead of trusting arbitrary mock claims.
    if (mock && typeof mock === "object") {
      const rawUser = mock.user ?? {};
      const rawRoles = mock.roles ?? rawUser.roles ?? (rawUser.role ? [rawUser.role] : []);
      const roles = normalizeRoles(rawRoles);
      const permissions = Array.from(
        new Set([
          ...(Array.isArray(mock.permissions) ? mock.permissions.map((p) => String(p)) : []),
          ...(Array.isArray(rawUser.permissions) ? rawUser.permissions.map((p) => String(p)) : []),
          ...roles.flatMap((role) => ROLE_PERMISSIONS[role] || []),
        ])
      );
      return { ...mock, roles, permissions, user: { ...rawUser, roles, permissions } };
    }
    return mock;
  }
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Helper function to extract user details and session state from raw response data.
 * Merges roles and parses associated permissions and scopes for user authorization checks.
 * 
 * @param {Object} data - Raw response data from the API (auth/profile response).
 * @param {string|null} fallbackEmail - Fallback identifier/email when not present in response.
 * @returns {Object} Extracted session user details.
 */
const extractSession = (data, fallbackEmail) => {
  const sessionToken = data?.token ?? data?.accessToken ?? null;
  const refreshToken = data?.refreshToken ?? null;
  const rawUser = data?.user ?? data?.data ?? data ?? null;
  const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
  const resolvedRoles = normalizeRoles(rawRoles);
  const tokenPermissions = Array.isArray(rawUser?.permissions)
    ? rawUser.permissions.map((p) => String(p))
    : [];
  const rolePermissions = resolvedRoles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  const permissions = Array.from(new Set([...tokenPermissions, ...rolePermissions]));
  const scopes =
    rawUser?.scopes ??
    (resolvedRoles.includes(ROLES.SUPER_ADMIN) || resolvedRoles.includes(ROLES.ADMIN)
      ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
      : resolvedRoles.includes(ROLES.ORGANIZER)
        ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
        : ["event:read", "hackathon:read"]);
  const sessionUser = {
    ...(rawUser || {}),
    firstName: rawUser?.firstName ?? "",
    lastName: rawUser?.lastName ?? "",
    email: rawUser?.email ?? fallbackEmail ?? "",
    username: rawUser?.username ?? fallbackEmail ?? "",
    role: rawUser?.role ?? resolvedRoles[0] ?? "",
    roles: resolvedRoles,
    permissions,
    scopes,
  };
  return { sessionToken, refreshToken, sessionUser };
};

/**
 * AuthProvider component wrapper.
 * Manages the core authenticated state, token management, session expiry timing,
 * and exposes API calls like login, logout, and security role checking utilities.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequest, setAuthRequest] = useState({ loading: false, error: null });
  const [requiresReauth, setRequiresReauth] = useState(false);

  // Ref to track mounting status and prevent setting state on unmounted components
  const isMountedRef = useRef(true);

  // Ref so session-clear flows can purge the current user's waitlist PII cache
  const userIdRef = useRef(null);
  useEffect(() => {
    userIdRef.current = user?.id || user?.email || null;
  }, [user]);

  // Ref to track whether session expired toast has already been displayed to prevent spamming
  const expiryToastShownRef = useRef(false);

  // Setup mount/unmount listener to control isMountedRef state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Helper function to clear all active session state.
   * Wipes cookie, local storage, API auth headers, and React local state.
   * 
   * @returns {boolean} True if state cleared, false if unmounted.
   */
  const clearSession = useCallback(() => {
    if (!isMountedRef.current) return false;
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setRefreshToken(null);

    // Invalidate token cookie (must match the name used in persistSession)
    deleteCookie("token", {
      path: "/",
      secureVariants: true,
    });

    // Clear user metadata from secure/local storage manager
    syncSecureStorage.removeItem("user");

    // Purge the current user's waitlist PII cache so it does not outlive the session
    if (userIdRef.current) {
      clearWaitlistCache(userIdRef.current);
    }
    return true;
  }, []);

  // Ref so the broadcast handler can call clearSession without stale closure
  const clearSessionRef = useRef(null);
  useEffect(() => {
    clearSessionRef.current = clearSession;
  }, [clearSession]);

  // Cross-tab session logout synchronizer
  useEffect(() => {
    const channel = getSessionChannel();
    if (!channel) return;

    const handleMessage = (event) => {
      if (event.data?.type === SESSION_TERMINATED) {
        clearSessionRef.current?.();
        window.location.replace("/login");
      }
    };

    channel.addEventListener("message", handleMessage);

    return () => {
      channel.removeEventListener("message", handleMessage);
      closeSessionChannel();
    };
  }, []);

  // Hook to handle periodic token validation and auto-logout on expiration
  useTokenExpiry({
    token,
    user,
    onExpired: clearSession
  });

  /**
   * Handler to cleanly expire the session, notify the user, and redirect them to login.
   * Utilizes ref to prevent toast duplications.
   */
  const clearExpiredSession = useCallback(() => {
    let hadPreviousSession = false;
    try {
      hadPreviousSession = !!syncSecureStorage.getItem("user");
    } catch (e) {
      console.warn("[AuthContext] Failed to read from secure storage during expiry check", e);
    }

    clearSession();

    if (!hadPreviousSession || expiryToastShownRef.current) return;
    expiryToastShownRef.current = true;
    toast.info(
      "Security notice: Your session has expired. Please log in again to continue securely.",
      {
        toastId: "session-expired",
        autoClose: 5000,
      }
    );

    setTimeout(() => {
      window.location.replace("/login");
    }, 1500);
  }, [clearSession]);

  /**
   * Effect hook running on mount to validate existing user profile.
   * Restores user profile and token status from backend session or local secure cache fallback.
   */
  useEffect(() => {
    const validate = async () => {
      try {
        const res = await apiUtils.get("/users/profile");
        let activeToken = "cookie-managed";
        if (!isMountedRef.current) return;

        if (res.ok && res.data) {
          const { sessionUser } = extractSession(res.data, res.data?.user?.email || null);
          if (!isMountedRef.current) return;
          setToken(activeToken);
          setUser(sessionUser);
        } else {
          clearSession();
        }
      } catch (err) {
        if (!isMountedRef.current) return;

        // If server returns unauthorized or forbidden, clear cached state
        if (err?.status === 401 || err?.status === 403) {
          clearSession();
        } else {
          // If network is offline, attempt to fall back to securely cached user details
          try {
            const cachedUser = await syncSecureStorage.getItemAsync("user");
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              // Never read a JS-readable token cookie (httpOnlyStorage policy).
              // The active token is held in JS memory by setAuthToken or by
              // the backend's HttpOnly Set-Cookie flow.
              setToken("cookie-managed");
            } else {
              clearSession();
            }
          } catch (storageErr) {
            console.error("[AuthContext] Secure storage fallback read failure:", storageErr);
            clearSession();
          }
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync clearExpiredSession method with a ref so api interceptor can safely invoke it without stale closures
  const clearExpiredSessionRef = useRef(clearExpiredSession);
  useEffect(() => {
    clearExpiredSessionRef.current = clearExpiredSession;
  }, [clearExpiredSession]);

  useEffect(() => {
    // Intercept 401 errors globally at Axios layer to auto-logout user
    setOnUnauthorizedHandler(() => clearExpiredSessionRef.current());
    setRequiresReauthHandler(() => {
      setRequiresReauth(true);
    });
    return () => {
      setOnUnauthorizedHandler(null);
      setRequiresReauthHandler(null);
    };
  }, []);

  /**
   * Monitor token age and expiry limits dynamically.
   * Auto-schedules logout timers or fallback verification intervals.
   */
  // Session expiry timer is centrally managed by useTokenExpiry above to avoid duplicate execution.

  /**
   * Persists the active session state to local variables and secure cache.
   * Strips administrative permissions/roles from plain storage to mitigate local XSS exploits.
   * 
   * @param {string} sessionToken - The active JWT token identifier or cookie placeholder.
   * @param {Object} sessionUser - The complete user profile object containing credentials.
   * @returns {boolean} Successful persistence state.
   */
  const persistSession = useCallback(async (sessionToken, sessionUser, refreshToken = null) => {
    setToken(sessionToken);
    setUser(sessionUser);
    setAuthToken(sessionToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    // Security Contract (src/utils/httpOnlyStorage.js): the bearer token is
    // held in JS memory only via setAuthToken above — it is never written to
    // a JS-readable document.cookie. HttpOnly cookie sessions are established
    // solely by the backend's Set-Cookie flow (axios uses withCredentials).

    try {
      // Security Contract: Strip authorization keys from display profile object stored in localStorage
      // eslint-disable-next-line no-unused-vars
      const { roles: _roles, permissions: _permissions, scopes: _scopes, ...displayProfile } = sessionUser;
      await syncSecureStorage.setItem("user", JSON.stringify(displayProfile));
    } catch (error) {
      console.error("[AuthContext] Error persisting user profile safely:", error);
    }
    return true;
  }, []);

  const setAuthSession = useCallback(
    (sessionToken, sessionUser, refreshToken = null) => {
      return persistSession(sessionToken, sessionUser, refreshToken);
    },
    [persistSession]
  );

  const getAuthErrorMessage = (error, fallbackMessage) => {
    const status = error?.status || error?.response?.status;
    if (status >= 500) {
      return "Something went wrong on our end. Please try again shortly.";
    }
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  };

  const login = useCallback(
    async (usernameOrEmail, password) => {
      setAuthRequest({ loading: true, error: null });

      try {
        const res = await authService.login({
          usernameOrEmail,
          password,
        });

        const data = res.data;

        const { sessionToken, refreshToken, sessionUser } = extractSession(data, usernameOrEmail);

        const tokenValue = sessionToken || data?.token || "cookie-managed";
        const persisted = await persistSession(tokenValue, sessionUser, refreshToken);
        if (!persisted) return false;

        setAuthRequest({ loading: false, error: null });
        return true;
      } catch (error) {
        if (!isMountedRef.current) return false;
        // Fix (Issue #8646):
        deleteCookie("token", {
          path: "/",
          secureVariants: true,
        });

        const status = error?.status || error?.response?.status;
        // Re-throw server errors so Login.js catch can show the correct message
        if (status >= 500) {
          setAuthRequest({ loading: false, error: null });
          throw error;
        }

        setAuthRequest({
          loading: false,
          error: getAuthErrorMessage(error, "Login failed. Please try again."),
        });
        return false;
      }
    },
    [persistSession]
  );

  /**
   * Logs out the user.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("[AuthContext] Backend logout request failed (best-effort error):", error);
    }
    clearSession();
    broadcastSessionTerminated();
    setAuthRequest({ loading: false, error: null });
  }, [clearSession]);

  /**
   * Quick utility helper to verify authentication state.
   */
  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (token === "cookie-managed") {
      if (typeof user.exp === "number" && Date.now() >= user.exp * 1000) {
        clearExpiredSession();
        return false;
      }
    } else if (!isTokenValid(token)) {
      clearExpiredSession();
      return false;
    }
    return true;
  }, [user, token, clearExpiredSession]);

  // Compute permissions using the external hook for roles and authorization queries
  const permissions = usePermissions(user);

  // Memoize context provider values to prevent redundant subscriber re-renders
  const value = useMemo(() => ({
    user,
    token,
    loading,
    authRequest,
    requiresReauth,
    setRequiresReauth,
    login,
    logout,
    setAuthSession,
    setUser,
    isAuthenticated,
    ...permissions,
  }), [
    user,
    token,
    loading,
    authRequest,
    requiresReauth,
    setRequiresReauth,
    login,
    logout,
    setAuthSession,
    setUser,
    isAuthenticated,
    permissions
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
      {requiresReauth && <ReAuthModal onSuccess={() => setRequiresReauth(false)} />}
    </AuthContext.Provider>
  );
};