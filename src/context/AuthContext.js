import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiUtils, setOnUnauthorizedHandler } from '../config/api';
import { isTokenValid } from '../utils/tokenUtils';
import { syncSecureStorage } from '../utils/secureStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Centralized session cleanup — clears both React state and secure storage.
  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    syncSecureStorage.removeItem('token');
    syncSecureStorage.removeItem('user');
  }, []);

  const readResponseData = async (response) => {
    if (!response) {
      return {};
    }

    if (response.data !== undefined) {
      return response.data;
    }

    if (typeof response.json === 'function') {
      return await response.json().catch(() => ({}));
    }

    return {};
  };

  useEffect(() => {
    // Check for existing authentication on app start
    const storedToken = syncSecureStorage.getItem('token');
    const storedUser = syncSecureStorage.getItem('user');

    if (storedToken && storedUser) {
      // --- Security fix: validate token before restoring session ---
      // Decode the JWT payload and check the `exp` claim. If the token
      // is expired or malformed, discard it instead of restoring a
      // broken session that would silently fail on every API call.
      if (isTokenValid(storedToken)) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Corrupted user data in localStorage — clear everything.
          clearSession();
        }
      } else {
        // Token is expired or invalid — clean up stale session data.
        clearSession();
      }
    }

    setLoading(false);
  }, [clearSession]);

  // --- Global 401 handler ---
  // Register a callback so that any API call receiving a 401 Unauthorized
  // response automatically clears the session. This prevents "zombie"
  // authenticated states where the frontend thinks the user is logged in
  // but every backend call fails silently.
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      clearSession();
    });

    // Cleanup on unmount
    return () => setOnUnauthorizedHandler(null);
  }, [clearSession]);

  // --- Periodic Token Expiry Check ---
  // Check token validity in the background so we don't mutate state during a render.
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      if (!isTokenValid(token)) {
        clearSession(); // Safe here because useEffect runs AFTER rendering finishes
      }
    };

    // Check immediately when the component mounts or token changes
    checkTokenExpiry();

    // Check periodically every 15 seconds to catch mid-session expiry
    const interval = setInterval(checkTokenExpiry, 15000);
    return () => clearInterval(interval);
  }, [token, clearSession]);

  const persistSession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    syncSecureStorage.setItem('token', sessionToken);
    syncSecureStorage.setItem('user', JSON.stringify(sessionUser));
  };

  const extractSession = (res, data, fallbackEmail) => {
    let sessionToken = data?.token ?? data?.accessToken ?? null;

    if (!sessionToken) {
      const authHeader =
        res?.headers?.get?.('Authorization') ||
        res?.headers?.get?.('authorization') ||
        res?.headers?.authorization ||
        res?.headers?.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7);
      }
    }

    const rawUser = data?.user ?? data?.data ?? data ?? null;
    const resolvedRoles = rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []);
    const sessionUser = {
      ...(rawUser || {}),
      firstName: rawUser?.firstName ?? '',
      lastName: rawUser?.lastName ?? '',
      email: rawUser?.email ?? fallbackEmail ?? '',
      username: rawUser?.username ?? fallbackEmail ?? '',
      role: rawUser?.role ?? resolvedRoles[0] ?? '',
      roles: resolvedRoles,
      permissions: rawUser?.permissions ?? [],
      scopes: rawUser?.scopes ?? (
        resolvedRoles.includes('ADMIN') ? ["admin:all", "event:write", "event:read", "hackathon:write", "hackathon:read"] :
        resolvedRoles.includes('EVENT_MANAGER') ? ["event:write", "event:read", "hackathon:write", "hackathon:read"] :
        ["event:read", "hackathon:read"]
      ),
    };

    return { sessionToken, sessionUser };
  };

  const setAuthSession = (sessionToken, sessionUser) => {
    persistSession(sessionToken, sessionUser);
    return true;
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const res = await apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, {
        usernameOrEmail,
        password,
      });

      const data = await readResponseData(res);
      const { sessionToken, sessionUser } = extractSession(res, data || {}, usernameOrEmail);

      if (!sessionToken) {
        throw new Error('Login failed: token missing from response');
      }

      persistSession(sessionToken, sessionUser);
      return true;
    } catch (error) {
      const backendMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      throw new Error(backendMessage || 'Invalid credentials');
    }
  };

  // Decode a JWT payload (base64url) without external libraries
  const decodeJwtPayload = (jwt) => {
    try {
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch (err) {
      console.error('Failed to decode Google credential:', err);
      return null;
    }
  };

  // Sign in with Google using the credential returned by Google Identity Services.
  // TODO: Send `credential` to backend (e.g. /api/auth/google) for server-side
  // verification and to receive a backend-issued session token. For now we decode
  // the Google ID token on the client so the UI flow works end-to-end.
  const signInWithGoogle = async (credential) => {
    if (!credential) {
      throw new Error('Google Sign-In failed: missing credential');
    }

    const payload = decodeJwtPayload(credential);
    if (!payload || !payload.email) {
      throw new Error('Google Sign-In failed: invalid credential');
    }

    const sessionUser = {
      firstName: payload.given_name || '',
      lastName: payload.family_name || '',
      email: payload.email,
      username: payload.email,
      picture: payload.picture || '',
      role: '',
      roles: [],
      permissions: [],
      provider: 'google',
    };

    // Using the Google credential as the session token until backend support is added.
    persistSession(credential, sessionUser);
    return true;
  };

  const logout = () => {
    clearSession();
  };

 const isAuthenticated = useCallback(() => {
    // Also verify the current token hasn't expired since it was stored.
    if (!user || !token) return false;
    if (!isTokenValid(token)) {
      // Token expired mid-session — safely return false without mutating state
      return false;
    }
    return true;
  }, [user, token]);

  const hasRole = (roleName) => {
    return user?.roles?.includes(roleName) || false;
  };

  const hasPermission = (permissionName) => {
    return user?.permissions?.includes(permissionName) || false;
  };

  const hasAnyRole = (...roleNames) => {
    return roleNames.some(role => hasRole(role));
  };

  const hasAnyPermission = (...permissionNames) => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  const isEventManager = () => hasRole('EVENT_MANAGER');
  const isSuperAdmin = () => hasRole('SUPER_ADMIN');
  const isOrganizer = () => hasRole('ORGANIZER');
  const isVolunteer = () => hasRole('VOLUNTEER');
  const isAttendee = () => hasRole('ATTENDEE');

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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};