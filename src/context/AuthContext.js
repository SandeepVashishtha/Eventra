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

;

const login = async (email, password) => {
  const url = API_ENDPOINTS.AUTH.LOGIN;

  // helpers
  const parseJsonSafe = async (res) => {
    try { return await res.json(); } catch { return null; }
  };

  const extractTokenAndUser = (res, data) => {
    // token in body
    let token = data?.token ?? data?.accessToken ?? null;

    // or token in header: Authorization: Bearer <jwt>
    if (!token) {
      const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // user in body (common patterns)
    const rawUser = data?.user ?? data?.data ?? null;

    return { token, rawUser };
  };

  // Try 1: form-encoded with email/password
  const attempts = [
    {
      desc: 'form-email',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password }).toString(),
      },
    },
    // Try 2: form-encoded with username/password
    {
      desc: 'form-username',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: email, password }).toString(),
      },
    },
    // Try 3: JSON (if backend actually expects JSON)
    {
      desc: 'json',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      },
    },
  ];

  let lastError = '';

  for (const attempt of attempts) {
    const res = await fetch(url, attempt.init);
    const data = await parseJsonSafe(res);

    if (!res.ok) {
      // keep the most helpful error text around
      const reason =
        (data && (data.message || data.error || JSON.stringify(data))) ||
        `${res.status} ${res.statusText}`;
      lastError = `[${attempt.desc}] ${reason}`;
      continue; // try next shape
    }

    const { token, rawUser } = extractTokenAndUser(res, data || {});
    if (!token) {
      lastError = `[${attempt.desc}] missing token in body or Authorization header`;
      continue;
    }

    const userData = {
      ...(rawUser || {}),
      roles: (rawUser?.roles) || [],
      permissions: (rawUser?.permissions) || ["HOST_HACKATHON"],
      email: rawUser?.email || email, // best-effort fill
    };

    // success
    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  }

  throw new Error(`Login failed: ${lastError || 'unexpected response'}`);
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
  setUser,   // ✅ expose setUser
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
