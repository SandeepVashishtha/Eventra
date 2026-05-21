import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, apiUtils } from '../config/api';

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

  useEffect(() => {
    // Check for existing authentication on app start
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

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
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAuthenticated = () => {
    return !!(user && token);
  };

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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};