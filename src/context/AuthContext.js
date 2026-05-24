import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiUtils, setOnUnauthorizedHandler } from '../config/api';
import { isTokenValid } from '../utils/tokenUtils';

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

  // Centralized session cleanup — clears both React state and localStorage.
  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    // Check for existing authentication on app start
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

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
    setOnUnauthorizedHandler(clearSession);

    // Cleanup on unmount
    return () => setOnUnauthorizedHandler(null);
  }, [clearSession]);

  const persistSession = (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    localStorage.setItem('token', sessionToken);
    localStorage.setItem('user', JSON.stringify(sessionUser));
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
    const sessionUser = {
      ...(rawUser || {}),
      firstName: rawUser?.firstName ?? '',
      lastName: rawUser?.lastName ?? '',
      email: rawUser?.email ?? fallbackEmail ?? '',
      username: rawUser?.username ?? fallbackEmail ?? '',
      role: rawUser?.role ?? rawUser?.roles?.[0] ?? '',
      roles: rawUser?.roles ?? (rawUser?.role ? [rawUser.role] : []),
      permissions: rawUser?.permissions ?? [],
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

  const data = await res.json().catch(() => null);

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



  const logout = () => {
    clearSession();
  };

  const isAuthenticated = useCallback(() => {
    // Also verify the current token hasn't expired since it was stored.
    if (!user || !token) return false;
    if (!isTokenValid(token)) {
      // Token expired mid-session — clean up immediately.
      clearSession();
      return false;
    }
    return true;
  }, [user, token, clearSession]);

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

  const isEventManager = () => {
    return hasRole('EVENT_MANAGER');
  };

const value = {
  user,
  token,
  loading,
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
  isEventManager
};


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
