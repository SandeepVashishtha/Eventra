import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { API_ENDPOINTS, apiUtils, setOnUnauthorizedHandler } from "../config/api";
import { isTokenValid, decodeTokenPayload } from "../utils/tokenUtils";
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

  const isMountedRef = useRef(false);
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
    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; HttpOnly; SameSite=Strict";
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    return true;
  }, []);

  const clearExpiredSession = useCallback(() => {
    // eslint-disable-next-line no-console
    console.warn("[AuthContext] Session expiration detected. Clearing session state immediately.");
    clearSession();

    if (expiryToastShownRef.current) {
      return;
    }

    expiryToastShownRef.current = true;
    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 5000,
    });
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
      let sessionToken = data?.token ?? data?.accessToken ?? null;

      if (!sessionToken) {
        const authHeader = res.headers?.authorization || res.headers?.Authorization || null;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          sessionToken = authHeader.substring(7);
        }
      }

      const rawUser = data?.user ?? data?.data ?? data ?? null;
      const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
      const resolvedRoles = normalizeRoles(rawRoles);
      const tokenPermissions = Array.isArray(rawUser?.permissions)
    return () => setOnUnauthorizedHandler(null);
  }, [clearExpiredSession]);

  useEffect(() => {
    if (needsExpiryCleanupRef.current) {
      needsExpiryCleanupRef.current = false;
      clearExpiredSession();
    }
  }, [clearExpiredSession]);

  useEffect(() => {
    if (!token) return;
            setAuthRequest({
              loading: false,
              error: null,
            });

    expiryToastShownRef.current = false;

    if (token === "cookie-managed") {
      return;
    }

          const normalizeRoles = useCallback((roles = []) => {
            return roles.map((role) => {
              const normalized = String(role).toUpperCase();
              return normalized === "EVENT_MANAGER" ? ROLES.ORGANIZER : normalized;
            });
          }, []);

          const extractSession = useCallback(
            (res, data, fallbackEmail) => {
              let sessionToken = data?.token ?? data?.accessToken ?? null;

              if (!sessionToken) {
                const authHeader = res.headers?.authorization || res.headers?.Authorization || null;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                  sessionToken = authHeader.substring(7);
                }
              }

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

          const clearExpiredSession = useCallback(() => {
            // eslint-disable-next-line no-console
            console.warn("[AuthContext] Session expiration detected. Clearing session state immediately.");
            clearSession();

            if (expiryToastShownRef.current) {
              return;
            }

            expiryToastShownRef.current = true;
            toast.info("Session expired. Please log in again.", {
              toastId: "session-expired",
              autoClose: 5000,
            });
          }, [clearSession]);

          const setAuthRequestState = useCallback((nextState) => {
            if (!isMountedRef.current) return false;

            setAuthRequest(nextState);
            return true;
          }, []);


      persistSession(sessionToken, sessionUser);
      return true;
    } catch (error) {
      setAuthRequest((prev) => ({
        ...prev,
        error: getAuthErrorMessage(error, "Login failed. Please try again."),
      }));
      throw error;
    } finally {
      setAuthRequest((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  /**
   * Sign in with a Google credential returned by @react-oauth/google.
   *
   * SECURITY NOTE
   * -------------
   * The Google ID token (credential) MUST be verified server-side.
   * Client-side JWT decoding only reads the payload — it does NOT verify
   * the cryptographic signature, audience (aud), issuer (iss), or expiry.
   * Skipping the backend exchange would allow any Google-issued token
   * (even one issued for a completely different application) to create a
   * valid session in Eventra.
   *
   * Flow:
   *  1. POST the raw Google credential to the Eventra backend.
   *  2. The backend verifies it against Google's JWKS endpoint and checks
   *     aud, iss, exp, and email_verified.
   *  3. On success the backend returns an Eventra-signed JWT + user object.
   *  4. We persist ONLY the Eventra JWT — never the raw Google token.
   *
   * @param {string} credential - Raw Google ID token from @react-oauth/google
   * @returns {Promise<true>} Resolves to true on success
   * @throws {Error} If the credential is missing, the backend rejects it,
   *                 or the response does not contain an Eventra token
   */
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
        const res = await apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, {
          usernameOrEmail,
          password,
        });

        const data = res.data;

        if (res.status !== 200) {
          throw new Error(data?.message || data?.error || "Invalid credentials");
        }

        const { sessionToken, sessionUser } = extractSession(res, data, usernameOrEmail);

        if (!sessionToken) {
          throw new Error("Login failed: token missing from response");
        }

        const persisted = persistSession(sessionToken, sessionUser);
        if (!persisted) return false;

        setAuthRequestState({ loading: false, error: null });
        return true;
      } catch (error) {
        if (!isMountedRef.current) return false;
        setAuthRequestState({ loading: false, error: getAuthErrorMessage(error, "Login failed. Please try again.") });
        throw error;
      }
    },
    [extractSession, persistSession, setAuthRequestState]
  );

  const signInWithGoogle = useCallback(
    async (credential) => {
      if (!credential) {
        const error = new Error("Google Sign-In failed: missing credential");
        setAuthRequestState({ loading: false, error: error.message });
        throw error;
      }

      if (!setAuthRequestState({ loading: true, error: null })) {
        return false;
      }

      let res;
      try {
        res = await apiUtils.post(API_ENDPOINTS.AUTH.GOOGLE, { token: credential });
      } catch (networkError) {
        const error = new Error(
          `Google Sign-In failed: could not reach the server. ${
            networkError?.message || "Please check your connection and try again."
          }`
        );
        if (!isMountedRef.current) return false;
        setAuthRequestState({ loading: false, error: error.message });
        throw error;
      }

      const data = res.data;

      if (res.status !== 200) {
        const error = new Error(
          data?.message || data?.error || `Google Sign-In failed: server returned ${res.status}`
        );
        if (!isMountedRef.current) return false;
        setAuthRequestState({ loading: false, error: error.message });
        throw error;
      }

      const { sessionToken, sessionUser } = extractSession(res, data, null);

      if (!sessionToken) {
        const error = new Error(
          "Google Sign-In failed: the server did not return an authentication token."
        );
        if (!isMountedRef.current) return false;
        setAuthRequestState({ loading: false, error: error.message });
        throw error;
      }

      const persisted = persistSession(sessionToken, sessionUser);
      if (!persisted) return false;

      setAuthRequestState({ loading: false, error: null });
      return true;
    },
    [extractSession, persistSession, setAuthRequestState]
  );

  const logout = useCallback(() => {
    clearSession();
    setAuthRequestState({ loading: false, error: null });
  }, [clearSession, setAuthRequestState]);

  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (token !== "cookie-managed" && !isTokenValid(token)) {
      needsExpiryCleanupRef.current = true;
      return false;
    }
    return true;
  }, [user, token]);

  const hasRole = useCallback(
    (roleName) => {
      if (!user?.roles) return false;
      const targetRole = String(roleName).toUpperCase();
      return normalizeRoles(user.roles).includes(targetRole);
    },
    [normalizeRoles, user]
  );

  const hasPermission = useCallback(
    (permissionName) => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permissionName);
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (...roleNames) => roleNames.some((role) => hasRole(role)),
    [hasRole]
  );

  const hasAnyPermission = useCallback(
    (...permissionNames) => permissionNames.some((permission) => hasPermission(permission)),
    [hasPermission]
  );

  const isAdmin = useCallback(() => hasRole(ROLES.ADMIN), [hasRole]);
  const isEventManager = useCallback(() => hasRole(ROLES.ORGANIZER), [hasRole]);
  const isSuperAdmin = useCallback(() => hasRole(ROLES.SUPER_ADMIN), [hasRole]);
  const isOrganizer = useCallback(() => hasRole(ROLES.ORGANIZER), [hasRole]);
  const isVolunteer = useCallback(() => hasRole(ROLES.VOLUNTEER), [hasRole]);
  const isAttendee = useCallback(() => hasRole(ROLES.ATTENDEE), [hasRole]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authRequest,
      login,
      logout,
      signInWithGoogle,
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
      signInWithGoogle,
      setAuthSession,
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
