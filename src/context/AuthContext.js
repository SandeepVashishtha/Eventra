import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { setOnUnauthorizedHandler, setAuthToken } from "../config/api";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { isTokenValid, decodeTokenPayload } from "../utils/tokenUtils";
import { syncSecureStorage } from "../utils/secureStorage";
import { toast } from "react-toastify";
import { ROLES, ROLE_PERMISSIONS } from "../config/roles";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequest, setAuthRequest] = useState({
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const needsExpiryCleanupRef = useRef(false);
  const expiryToastShownRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearSession = useCallback(() => {
    if (!isMountedRef.current) return false;

    setUser(null);
    setToken(null);
    setAuthToken(null);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict";
    syncSecureStorage.removeItem("user");
    return true;
  }, []);

  const clearExpiredSession = useCallback(() => {
    // 🔥 FIX: Check if a user was actually logged in before blasting them with an "Expired" toast.
    // Anonymous users (who trigger a 401 on mount) shouldn't see this.
    let hadPreviousSession = false;
    try {
      hadPreviousSession = !!syncSecureStorage.getItem("user");
    } catch {
      // localStorage unavailable (private browsing, quota exceeded, etc.)
    }

    console.warn("[AuthContext] Session expiration detected. Clearing session state immediately.");
    clearSession();

    // If they were never logged in, this is just a guest pinging the API. Silent exit.
    if (!hadPreviousSession) return;

    if (expiryToastShownRef.current) {
      return;
    }

    expiryToastShownRef.current = true;
    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 4000,
    });
    setTimeout(() => {
      window.location.replace("/login");
    }, 1500);
  }, [clearSession]);

  const setAuthRequestState = useCallback((nextState) => {
    if (!isMountedRef.current) return false;

    setAuthRequest(nextState);
    return true;
  }, []);

  const normalizeRoles = useCallback((roles = []) => {
    return roles.map((role) => {
      const normalized = String(role).toUpperCase();
      return normalized === "EVENT_MANAGER" ? ROLES.ORGANIZER : normalized;
    });
  }, []);

  const extractSession = useCallback(
    (res, data, fallbackEmail) => {
      // Under a strict HttpOnly-cookie authentication model, the client-visible
      // response body or headers (like data.token, data.accessToken, and Authorization
      // response headers) are ignored entirely to prevent token-injection risks.
      // Authenticated sessions are established solely through successful backend
      // validation of the HttpOnly session cookie, using the sentinel value "cookie-managed".
      const sessionToken = "cookie-managed";

      const rawUser = data?.user ?? data?.data ?? data ?? null;
      const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
      const resolvedRoles = normalizeRoles(rawRoles);
      const tokenPermissions = Array.isArray(rawUser?.permissions)
        ? rawUser.permissions.map((permission) => String(permission))
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

      return { sessionToken, sessionUser };
    },
    [normalizeRoles]
  );

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await userService.getProfile();
        if (!isMountedRef.current) return;

        if (res.ok && res.data) {
          const { sessionToken, sessionUser } = extractSession(res, res.data, null);
          if (!isMountedRef.current) return;
          setToken(sessionToken || "cookie-managed");
          setUser(sessionUser);
        } else {
          clearSession();
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        
        const isAuthError = err?.status === 401 || err?.status === 403;
        if (isAuthError) {
          clearSession();
        } else {
          console.warn("[AuthContext] Network error during session validation. Preserving local session.");
          try {
            const cachedUser = syncSecureStorage.getItem("user");
            if (cachedUser) {
              setUser(JSON.parse(cachedUser));
              setToken("cookie-managed");
            } else {
              clearSession();
            }
          } catch {
            clearSession();
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    // 🔥 THE FIX: We removed the `if (localStorage.getItem("user"))` check! 🔥
    // The app will now ALWAYS ping the backend to verify HttpOnly cookies on load.
    validateSession();
  }, [clearSession, extractSession]);

  // --- FIX: Stable Global 401 handler ---
  const clearExpiredSessionRef = useRef(clearExpiredSession);

  // Keep the ref updated whenever the function changes
  useEffect(() => {
    clearExpiredSessionRef.current = clearExpiredSession;
  }, [clearExpiredSession]);

  // Register handler once on mount, referencing the latest logic via the ref
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      clearExpiredSessionRef.current();
    });

    // Cleanup only on unmount
    return () => setOnUnauthorizedHandler(null);
  }, []); // <--- Empty array here ensures it only runs once!

  useEffect(() => {
    if (needsExpiryCleanupRef.current) {
      needsExpiryCleanupRef.current = false;
      clearExpiredSession();
    }
  }, [clearExpiredSession]);

  // --- Smart Token Expiry Timeout ---
  useEffect(() => {
    if (!token) return;

    expiryToastShownRef.current = false;

    let expSeconds;
    if (token === "cookie-managed") {
      expSeconds = user?.exp;
    } else {
      const payload = decodeTokenPayload(token);
      expSeconds = payload?.exp;
    }

    let timeoutId;

    if (typeof expSeconds === "number") {
      const nowMs = Date.now();
      const expiresAtMs = expSeconds * 1000;
      const delayMs = Math.max(expiresAtMs - nowMs + 1000, 0);

      timeoutId = setTimeout(() => {
        if (token === "cookie-managed" ? Date.now() >= expiresAtMs : !isTokenValid(token)) {
          clearExpiredSession();
        }
      }, delayMs);
    } else {
      // If we have no expiration information, we can only rely on API 401s.
      // We do not ping blindly every 60s as it's wasteful.
      // But if there's a token, we check it.
      if (token !== "cookie-managed") {
        timeoutId = setInterval(() => {
          if (!isTokenValid(token)) {
            clearExpiredSession();
          }
        }, 60_000);

        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }
    }

    return () => {
      if (timeoutId) {
        if (typeof expSeconds === "number") {
          clearTimeout(timeoutId);
        } else {
          clearInterval(timeoutId);
        }
      }
    };
  }, [token, user?.exp, clearExpiredSession]);

  const persistSession = useCallback(async (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    setAuthToken(sessionToken);

    // The auth token is set exclusively by the server via a Set-Cookie response
    // header with HttpOnly; Secure; SameSite=Strict. Writing the token through
    // document.cookie here would create a second, JS-readable copy of the same
    // credential, exposing it to XSS-based theft. The client-side code only
    // needs to store the non-sensitive display profile (see below).

    // Strip authorization fields before persisting to storage. Roles, scopes,
    // and permissions are always re-derived from the backend on page load via
    // validateSession, so storing them client-side only widens the XSS attack
    // surface with no functional benefit.
    try {
      // eslint-disable-next-line no-unused-vars
      const { roles, permissions, scopes, ...displayProfile } = sessionUser;
      await syncSecureStorage.setItem("user", JSON.stringify(displayProfile));
    } catch (error) {
      console.error("[AuthContext] Error persisting user profile:", error);
    }
    return true;
  }, []);

  const setAuthSession = useCallback(
    (sessionToken, sessionUser) => {
      return persistSession(sessionToken, sessionUser);
    },
    [persistSession]
  );

  const getAuthErrorMessage = (error, fallbackMessage) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  };

  const login = useCallback(
    async (usernameOrEmail, password) => {
      if (!setAuthRequestState({ loading: true, error: null })) {
        return false;
      }

      try {
        const res = await authService.login({
          usernameOrEmail,
          password,
        });

        const data = res.data;

        if (res.status !== 200) {
          throw new Error(data?.message || data?.error || "Invalid credentials");
        }

        // extractSession now returns "cookie-managed" instead of null when the
        // server uses HttpOnly cookies and omits the token from the response
        // body. There is no longer a missing-token failure path here.
        const { sessionToken, sessionUser } = extractSession(res, data, usernameOrEmail);

        const persisted = await persistSession(sessionToken, sessionUser);
        if (!persisted) return false;

        setAuthRequestState({ loading: false, error: null });
        return true;
      } catch (error) {
        if (!isMountedRef.current) return false;
        setAuthRequestState({ loading: false, error: getAuthErrorMessage(error, "Login failed. Please try again.") });
        return false;
      }
    },
    [extractSession, persistSession, setAuthRequestState]
  );



  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn("[AuthContext] Backend logout failed, proceeding with local clear", error);
    }
    clearSession();
    setAuthRequestState({ loading: false, error: null });
  }, [clearSession, setAuthRequestState]);

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

  const hasRole = (roleName) => {
    if (!user?.roles) return false;
    const targetRole = String(roleName).toUpperCase();
    return normalizeRoles(user.roles).includes(targetRole);
  };

  const hasPermission = (permissionName) => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  const hasAnyRole = (...roleNames) => roleNames.some((role) => hasRole(role));

  const hasAnyPermission = (...permissionNames) => permissionNames.some((permission) => hasPermission(permission));

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isEventManager = () => hasRole(ROLES.ORGANIZER);
  const isSuperAdmin = () => hasRole(ROLES.SUPER_ADMIN);
  const isOrganizer = () => hasRole(ROLES.ORGANIZER);
  const isVolunteer = () => hasRole(ROLES.VOLUNTEER);
  const isAttendee = () => hasRole(ROLES.ATTENDEE);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authRequest,
      login,
      logout,
      setAuthSession,
      setUser,
      isAuthenticated,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAnyPermission,
      isAdmin,
      isEventManager,
      isSuperAdmin,
      isOrganizer,
      isVolunteer,
      isAttendee,
    }),
    [
      user,
      token,
      loading,
      authRequest,
      login,
      logout,
      setAuthSession,
      setUser,
      isAuthenticated,
      hasRole,
      hasPermission,
      hasAnyRole,
      hasAnyPermission,
      isAdmin,
      isEventManager,
      isSuperAdmin,
      isOrganizer,
      isVolunteer,
      isAttendee,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};