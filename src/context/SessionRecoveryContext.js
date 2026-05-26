import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';


const SessionRecoveryContext = createContext();

const SESSION_KEY = 'eventra_session_state';
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useSessionRecovery = () => {
  const context = useContext(SessionRecoveryContext);
  if (!context) {
    throw new Error('useSessionRecovery must be used within a SessionRecoveryProvider');
  }
  return context;
};

export const SessionRecoveryProvider = ({ children }) => {
  const [hasSession, setHasSession] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const lastActivityRef = useRef(Date.now());
  const saveTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    lastActivityRef.current = now;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsReconnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsReconnecting(true);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [updateActivity]);

  useEffect(() => {
    try {
      // Session loading from storage has been removed.
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, []);

  const saveSession = useCallback((state) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const currentSession = {
          ...state,
          timestamp: Date.now(),
          lastActivity: lastActivityRef.current,
        };
        // syncSecureStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        setSessionData(currentSession);
        setHasSession(true);
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }, 1000);
  }, []);

  const clearSession = useCallback(() => {
    try {
      // syncSecureStorage.removeItem(SESSION_KEY);
      setSessionData(null);
      setHasSession(false);
      setShowRecoveryPrompt(false);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }, []);

  const restoreSession = useCallback(() => {
    if (!sessionData) return null;
    return sessionData;
  }, [sessionData]);

  const dismissRecoveryPrompt = useCallback(() => {
    setShowRecoveryPrompt(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const inactiveTime = now - lastActivityRef.current;

      if (inactiveTime > SESSION_TIMEOUT && hasSession) {
        clearSession();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [hasSession, clearSession]);

  useEffect(() => {
    const saveTimeout = saveTimeoutRef.current;
    const activityTimeout = activityTimeoutRef.current;
    return () => {
      if (saveTimeout) clearTimeout(saveTimeout);
      if (activityTimeout) clearTimeout(activityTimeout);
    };
  }, []);

  const value = {
    hasSession,
    sessionData,
    isOnline,
    isReconnecting,
    showRecoveryPrompt,
    saveSession,
    clearSession,
    restoreSession,
    dismissRecoveryPrompt,
    lastActivity,
  };

  return (
    <SessionRecoveryContext.Provider value={value}>
      {children}
    </SessionRecoveryContext.Provider>
  );
};