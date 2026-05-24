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

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      if (isTokenValid(storedToken)) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
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
    setOnUnauthorizedHandler(clearSession);
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
    if (!user || !token) return false;
    if (!isTokenValid(token)) {
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