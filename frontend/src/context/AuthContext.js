import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const login = (authData) => {
    const { token, ...userData } = authData;
    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
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
