import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS, apiUtils, setOnUnauthorizedHandler } from '../config/api';
import { isTokenValid, decodeTokenPayload } from '../utils/tokenUtils';
import { toast } from 'react-toastify';
import { ROLES } from '../config/roles';
import { decodeJwtPayload } from '../utils/auth';


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

  // Ref-based flag so isAuthenticated() can request cleanup without
  // mutating state during a render (React rule).
  const needsExpiryCleanupRef = useRef(false);
  const expiryToastShownRef = useRef(false);

  // Centralized session cleanup — clears both React state and secure storage.
  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  /**
   * Clear the session AND notify the user via toast.
   * Guards against duplicate toasts with a ref flag.
   */
  const clearExpiredSession = useCallback(() => {
    // eslint-disable-next-line no-console
    console.warn("[AuthContext] Session expiration detected. Clearing session state immediately to prevent infinite layout re-render loops.");
    
    // 1. Immediately purge session state to prevent infinite render loops.
    // By resetting token and user state to null synchronously, any concurrent
    // render phases (e.g., layout components checking isAuthenticated) will
    // abort early, avoiding resetting needsExpiryCleanupRef.
    clearSession();

    // 2. Perform UI notification side effects once per expired session lifecycle.
    if (expiryToastShownRef.current) {
      // eslint-disable-next-line no-console
      console.log("[AuthContext] Expiry warning already shown. Skipping duplicate toast notification.");
      return;
    }
    expiryToastShownRef.current = true;

    toast.info("Session expired. Please log in again.", {
      toastId: "session-expired",
      autoClose: 5000,
    });
  }, [clearSession]);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await apiUtils.get(API_ENDPOINTS.USERS.PROFILE);
        if (res.ok && res.data) {
          const { sessionToken, sessionUser } = extractSession(res, res.data, null);
          setToken(sessionToken || 'cookie-managed');
          setUser(sessionUser);
        } else {
          clearSession();
        }
      } catch (error) {
        clearSession();
      }
      setLoading(false);
    };

    // If we have a user in localStorage, it's worth validating the session.
    // In a pure HttpOnly cookie setup, the cookie exists but is unreadable by JS.
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      validateSession();
    } else {
      setLoading(false);
    }
  }, [clearSession]);

  // --- Global 401 handler ---
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      clearExpiredSession();
    });

    // Cleanup on unmount
    return () => setOnUnauthorizedHandler(null);
  }, [clearExpiredSession]);

  // --- Deferred expiry cleanup ---
  // When isAuthenticated() detects an expired token during a render, it
  // sets needsExpiryCleanupRef. This effect runs AFTER render finishes
  // and performs the actual state cleanup + toast.
  //
  // FIX: Added [clearExpiredSession] dependency array.
  // Without a dependency array this effect ran after EVERY render of the
  // entire React tree (AuthProvider wraps everything). While the ref guard
  // prevented duplicate cleanups, the unnecessary post-render calls added
  // overhead and made the effect semantically misleading.
  // With [clearExpiredSession] it only re-runs when that stable callback
  // reference changes — which is effectively once on mount.
  useEffect(() => {
    if (needsExpiryCleanupRef.current) {
      needsExpiryCleanupRef.current = false;
      clearExpiredSession();
    }
  }, [clearExpiredSession]);

  // --- Smart Token Expiry Timeout ---
  // Instead of polling every 15 s, compute the exact remaining TTL from the
  // token's `exp` claim and schedule a single timeout. Falls back to a 60 s
  // interval if `exp` is missing or unparseable.
  useEffect(() => {
    if (!token) return;

    // Reset the toast guard when a new token is set (fresh login).
    expiryToastShownRef.current = false;

    // If we're using secure cookies, the token string is not available to the frontend.
    // We rely entirely on the global 401 interceptor for expiry.
    if (token === 'cookie-managed') {
      return;
    }

    const payload = decodeTokenPayload(token);
    const expSeconds = payload?.exp;

    let timeoutId;

    if (typeof expSeconds === "number") {
      const nowMs = Date.now();
      const expiresAtMs = expSeconds * 1000;
      // Fire 1 second after actual expiry to avoid edge-case races.
      const delayMs = Math.max(expiresAtMs - nowMs + 1000, 0);

      timeoutId = setTimeout(() => {
        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }, delayMs);
    } else {
      // No `exp` claim — fall back to a 60 s polling interval.
      timeoutId = setInterval(() => {
        if (!isTokenValid(token)) {
          clearExpiredSession();
        }
      }, 60_000);

      // Also check once immediately.
      if (!isTokenValid(token)) {
        clearExpiredSession();
      }
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    };
  }, [token, clearExpiredSession]);

  const persistSession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    
    // Set cookie with HttpOnly, Secure, SameSite flags
    document.cookie = `token=${sessionToken}; path=/; Secure; HttpOnly; SameSite=Strict`;
    
    try {
      localStorage.setItem("user", JSON.stringify(sessionUser));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[AuthContext] Error persisting user profile:', error);
    }
  };

  const normalizeRoles = (roles = []) => {
    return roles.map((role) => {
      const normalized = String(role).toUpperCase();

      if (normalized === 'EVENT_MANAGER') {
        return ROLES.ORGANIZER;
      }

      return normalized;
    });
  };

  /**
   * SECURITY: Extract roles from the signed JWT token.
   *
   * The JWT is the authoritative source for roles and permissions because:
   * 1. It's signed by the backend — the client cannot forge it
   * 2. It's delivered over HTTPS — it cannot be intercepted and modified
   * 3. Even if localStorage is tampered with, authorization checks use the JWT
   *
   * localStorage is used ONLY for UI state (caching display name, email, etc.),
   * never for security-critical decisions.
   *
   * @param {string} token - JWT token from sessionStorage
   * @returns {object|null} { roles, scopes } extracted from token, or null if invalid
   */
  const extractRolesFromToken = (token) => {
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload) return null;

    // Extract roles from the JWT payload (backend-signed, cannot be forged)
    const tokenRoles = (payload.roles || payload.role ? [payload.role] : []) || [];
    const normalizedRoles = normalizeRoles(tokenRoles);

    // Compute scopes from the authoritative roles in the token
    const scopes = normalizedRoles.includes(ROLES.ADMIN)
      ? ['admin:all', 'event:write', 'event:read', 'hackathon:write', 'hackathon:read']
      : normalizedRoles.includes(ROLES.ORGANIZER)
        ? ['event:write', 'event:read', 'hackathon:write', 'hackathon:read']
        : ['event:read', 'hackathon:read'];

    return { roles: normalizedRoles, scopes };
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
    const rawRoles =
      rawUser?.roles ??
      (rawUser?.role ? [rawUser.role] : []);

    const resolvedRoles = normalizeRoles(rawRoles);
    const sessionUser = {
      ...(rawUser || {}),
      firstName: rawUser?.firstName ?? "",
      lastName: rawUser?.lastName ?? "",
      email: rawUser?.email ?? fallbackEmail ?? "",
      username: rawUser?.username ?? fallbackEmail ?? "",
      role: rawUser?.role ?? resolvedRoles[0] ?? "",
      roles: resolvedRoles,
      permissions: rawUser?.permissions ?? [],
      scopes: rawUser?.scopes ?? (
        resolvedRoles.includes(ROLES.ADMIN)
          ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"]
          : resolvedRoles.includes(ROLES.ORGANIZER)
            ? ["event:write", "event:read", "hackathon:write", "hackathon:read"]
            : ["event:read", "hackathon:read"]
      ),
    };

    return { sessionToken, sessionUser };
  };

  const setAuthSession = (sessionToken, sessionUser) => {
    persistSession(sessionToken, sessionUser);
    return true;
  };

  const login = async (usernameOrEmail, password) => {
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

    // ── Step 1: Exchange the Google credential with the Eventra backend ──────
    // The backend is the only party that can verify the token's signature.
    let res;
    try {
      res = await apiUtils.post(API_ENDPOINTS.AUTH.GOOGLE, { token: credential });
    } catch (networkError) {
      // Surface network/timeout errors with a friendlier message
      throw new Error(
        `Google Sign-In failed: could not reach the server. ${
          networkError?.message || "Please check your connection and try again."
        }`
      );
    }

    // ── Step 2: Parse the backend response ───────────────────────────────────
    const data = res.data;

    if (res.status !== 200) {
      // The backend rejected the credential (bad token, wrong audience, etc.)
      throw new Error(
        data?.message ||
          data?.error ||
          `Google Sign-In failed: server returned ${res.status}`
      );
    }

    // ── Step 3: Extract and validate the Eventra-issued token ────────────────
    // extractSession normalises the response shape (handles token / accessToken
    // in body as well as a Bearer header), and builds a canonical sessionUser
    // with normalised roles and computed scopes.
    const { sessionToken, sessionUser } = extractSession(res, data, null);

    if (!sessionToken) {
      throw new Error(
        "Google Sign-In failed: the server did not return an authentication token."
      );
    }

    // ── Step 4: Persist the Eventra JWT (never the raw Google token) ─────────
    persistSession(sessionToken, sessionUser);
    return true;
  };

  const logout = () => {
    clearSession();
  };

  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (token !== 'cookie-managed' && !isTokenValid(token)) {
      // Token expired mid-session — flag for deferred cleanup.
      // Cannot call clearSession() here because this runs during render.
      needsExpiryCleanupRef.current = true;
      return false;
    }
    return true;
  }, [user, token]);

  const hasRole = (roleName) => {
    if (!user?.roles || !token) return false;

    // SECURITY: Always verify against the JWT token (server-signed).
    // Even if React state is somehow corrupted or localStorage is tampered with,
    // the JWT cannot be forged client-side.
    const tokenRoleData = extractRolesFromToken(token);
    if (!tokenRoleData || !tokenRoleData.roles) return false;

    const targetRole = String(roleName).toUpperCase();
    return tokenRoleData.roles.includes(targetRole);
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
