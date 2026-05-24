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

  useEffect(() => {
    // Check for existing authentication on app start
    const storedToken = syncSecureStorage.getItem('token');
    const storedUser = syncSecureStorage.getItem('user');

    if (storedToken && storedUser) {
      // --- Security fix: validate token before restoring session ---
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
  useEffect(() => {
    setOnUnauthorizedHandler(() => {
      clearSession();
    });

    // Cleanup on unmount
    return () => setOnUnauthorizedHandler(null);
  }, [clearSession]);

  // --- Periodic Token Expiry Check ---
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
      const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
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
    const res = await apiUtils.post(API_ENDPOINTS.AUTH.LOGIN, {
      usernameOrEmail,
      password,
    });

    const data = await res.json().catch((error) => {
      console.error('Failed to parse login response JSON:', error);
      return null;
    });

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Invalid credentials');
    }

    const { sessionToken, sessionUser } = extractSession(res, data || {}, usernameOrEmail);

    if (!sessionToken) {
      throw new Error('Login failed: token missing from response');
    }

    persistSession(sessionToken, sessionUser);
    return true;
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

    persistSession(credential, sessionUser);
    return true;
  };

  const logout = () => {
    clearSession();
  };

  const isAuthenticated = useCallback(() => {
    if (!user || !token) return false;
    if (!isTokenValid(token)) {
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

  const isAdmin = () => hasRole('ADMIN');
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