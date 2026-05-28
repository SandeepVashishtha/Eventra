import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS, apiUtils, setOnUnauthorizedHandler } from '../config/api';
import { isTokenValid, decodeTokenPayload } from '../utils/tokenUtils';
import { syncSecureStorage } from '../utils/secureStorage';
import { toast } from 'react-toastify';
import { ROLES, ROLE_PERMISSIONS } from '../config/roles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/**
 * Builds a minimal, safe user object for storage — excludes recomputable fields
 * (scopes, permissions) so they are never blindly trusted from storage.
 *
 * @param {object} sessionUser - Full session user
 * @returns {object} Reduced user safe for persistence
 */
const buildStorableUser = (sessionUser) => ({
  firstName: sessionUser.firstName ?? "",
  lastName: sessionUser.lastName ?? "",
  email: sessionUser.email ?? "",
  username: sessionUser.username ?? "",
  role: sessionUser.role ?? "",
  roles: sessionUser.roles ?? [],
  avatarUrl: sessionUser.avatarUrl ?? sessionUser.avatar_url ?? null,
  id: sessionUser.id ?? null,
});

/**
 * Recomputes permissions and scopes from roles so stored data can never be
 * used to elevate privileges — these fields are always derived, never read
 * from storage.
 *
 * @param {string[]} roles - Normalized role list
 * @returns {{ permissions: string[], scopes: string[] }}
 */
const deriveSecurityFields = (roles = []) => {
  const rolePermissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  const permissions = Array.from(new Set(rolePermissions));

  const scopes = roles.includes(ROLES.SUPER_ADMIN) || roles.includes(ROLES.ADMIN)
    ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
    : roles.includes(ROLES.ORGANIZER)
      ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
      : ["event:read", "hackathon:read"];

  return { permissions, scopes };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const needsExpiryCleanupRef = useRef(false);
  const expiryToastShownRef = useRef(false);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    syncSecureStorage.removeItem("token");
    syncSecureStorage.removeItem("user");
  }, []);

  const clearExpiredSession = useCallback(() => {
    if (expiryToastShownRef.current) return;
    expiryToastShownRef.current = true;
    clearSession();
    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 5000,
    });
  }, [clearSession]);

  useEffect(() => {
    const storedToken = syncSecureStorage.getItem("token");
    const storedUser = syncSecureStorage.getItem("user");

    if (storedToken && storedUser) {
      if (isTokenValid(storedToken)) {
        setToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUser);

          const normalizedRoles = (parsedUser?.roles ?? []).map((role) => {
            const upper = String(role).toUpperCase();
            return upper === "EVENT_MANAGER" ? ROLES.ORGANIZER : upper;
          });
          parsedUser.roles = normalizedRoles;

          // Always derive permissions and scopes from roles — never trust stored values.
          // This prevents a local-storage edit from granting elevated privileges.
          const { permissions, scopes } = deriveSecurityFields(normalizedRoles);
          parsedUser.permissions = permissions;
          parsedUser.scopes = scopes;

          setUser(parsedUser);
        } catch {
          clearSession();
        }
      } else {
        clearSession();
      }
    }

    setLoading(false);
  }, [clearSession]);

  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      clearExpiredSession();
    });
    return () => setOnUnauthorizedHandler(null);
  }, [clearExpiredSession]);

  useEffect(() => {
    if (needsExpiryCleanupRef.current) {
      needsExpiryCleanupRef.current = false;
      clearExpiredSession();
    }
  });

  useEffect(() => {
    if (!token) return;

    expiryToastShownRef.current = false;

    const payload = decodeTokenPayload(token);
    const expSeconds = payload?.exp;

    let timeoutId;

    if (typeof expSeconds === "number") {
      const nowMs = Date.now();
      const expiresAtMs = expSeconds * 1000;
      const delayMs = Math.max(expiresAtMs - nowMs + 1000, 0);

      timeoutId = setTimeout(() => {
        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }, delayMs);
    } else {
      timeoutId = setInterval(() => {
        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }, 60_000);

      if (!isTokenValid(token)) {
        clearExpiredSession();
      }
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    };
  }, [token, clearExpiredSession]);

  /**
   * Persists a session using syncSecureStorage for both token and user profile.
   * Only a minimal subset of user data is stored — permissions and scopes are
   * always recomputed on restore and never read from storage.
   */
  const persistSession = useCallback((sessionToken, sessionUser) => {
    setToken(sessionToken);

    // Recompute derived security fields before setting state so the in-memory
    // user object always has accurate permissions regardless of what was stored.
    const normalizedRoles = sessionUser.roles ?? [];
    const { permissions, scopes } = deriveSecurityFields(normalizedRoles);
    const fullUser = { ...sessionUser, permissions, scopes };
    setUser(fullUser);

    try {
      syncSecureStorage.setItem("token", sessionToken);
      // Store only the minimal safe subset — do not store permissions or scopes.
      syncSecureStorage.setItem("user", JSON.stringify(buildStorableUser(sessionUser)));
    } catch (error) {
      console.error('[AuthContext] Error persisting session:', error);
    }
  }, []);

  const normalizeRoles = (roles = []) => {
    return roles.map((role) => {
      const normalized = String(role).toUpperCase();
      return normalized === 'EVENT_MANAGER' ? ROLES.ORGANIZER : normalized;
    });
  };

  const extractSession = (res, data, fallbackEmail) => {
    let sessionToken = data?.token ?? data?.accessToken ?? null;

    if (!sessionToken) {
      const authHeader = res.headers?.['authorization'] || res.headers?.['Authorization'] || null;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }

    const rawUser = data?.user ?? data?.data ?? data ?? null;
    const rawRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
    const resolvedRoles = normalizeRoles(rawRoles);
    const { permissions, scopes } = deriveSecurityFields(resolvedRoles);

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
  };

  const setAuthSession = useCallback((sessionToken, sessionUser) => {
    persistSession(sessionToken, sessionUser);
    return true;
  }, [persistSession]);

  const login = async (usernameOrEmail, password) => {
    const res = await apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, {
      usernameOrEmail,
      password,
    });

    const data = await res.json().catch((error) => {
      console.error("Failed to parse login response JSON:", error);
      return null;
    });

    if (!res.ok) {
      throw new Error(data?.message || data?.error || "Invalid credentials");
    }

    const { sessionToken, sessionUser } = extractSession(res, data, usernameOrEmail);

    if (!sessionToken) {
      throw new Error("Login failed: token missing from response");
    }

    persistSession(sessionToken, sessionUser);
    return true;
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
  const signInWithGoogle = async (credential) => {
    if (!credential) {
      throw new Error("Google Sign-In failed: missing credential");
    }

    let res;
    try {
      res = await apiUtils.post(API_ENDPOINTS.AUTH.GOOGLE, { token: credential });
    } catch (networkError) {
      throw new Error(
        `Google Sign-In failed: could not reach the server. ${
          networkError?.message || "Please check your connection and try again."
        }`
      );
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        data?.message ||
          data?.error ||
          `Google Sign-In failed: server returned ${res.status}`
      );
    }

    const { sessionToken, sessionUser } = extractSession(res, data, null);

    if (!sessionToken) {
      throw new Error(
        "Google Sign-In failed: the server did not return an authentication token."
      );
    }

    persistSession(sessionToken, sessionUser);
    return true;
  };

  const logout = () => {
    clearSession();
  };

  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (!isTokenValid(token)) {
      needsExpiryCleanupRef.current = true;
      return false;
    }
    return true;
  }, [user, token]);

  const hasRole = (roleName) => {
    if (!user?.roles) return false;
    return normalizeRoles(user.roles).includes(String(roleName).toUpperCase());
  };

  const hasPermission = (permissionName) => user?.permissions?.includes(permissionName) || false;

  const hasAnyRole = (...roleNames) => roleNames.some((role) => hasRole(role));

  const hasAnyPermission = (...permissionNames) =>
    permissionNames.some((permission) => hasPermission(permission));

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isEventManager = () => hasRole(ROLES.ORGANIZER);
  const isSuperAdmin = () => hasRole(ROLES.SUPER_ADMIN);
  const isOrganizer = () => hasRole(ROLES.ORGANIZER);
  const isVolunteer = () => hasRole(ROLES.VOLUNTEER);
  const isAttendee = () => hasRole(ROLES.ATTENDEE);

  const value = {
    user,
    token,
    loading,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
