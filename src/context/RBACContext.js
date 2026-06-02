import React, { createContext, useContext, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';

/**
 * RBAC Policy Schema Example
 * In production, this would be fetched from the backend.
 */
const DEFAULT_POLICIES = {
  "admin": ["event:read", "event:write", "ticket:scan", "analytics:view", "roles:manage"],
  "organizer": ["event:read", "event:write", "ticket:scan", "analytics:view"],
  "checkin_staff": ["event:read", "ticket:scan"],
  "marketing": ["event:read", "analytics:view"],
  "attendee": ["event:read"]
};

const RBACContext = createContext();

export const RBACProvider = ({ children }) => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState(DEFAULT_POLICIES);

  // Determine user's combined permissions based on their assigned roles
  const userPermissions = useMemo(() => {
    if (!user || !user.roles) return [];
    
    const permissions = new Set();
    user.roles.forEach(role => {
      const normalizedRole = role.toLowerCase();
      if (policies[normalizedRole]) {
        policies[normalizedRole].forEach(p => permissions.add(p));
      }
    });
    
    return Array.from(permissions);
  }, [user, policies]);

  const can = (action) => {
    return userPermissions.includes(action) || userPermissions.includes("admin:all");
  };

  return (
    <RBACContext.Provider value={{ policies, userPermissions, can, setPolicies }}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};
