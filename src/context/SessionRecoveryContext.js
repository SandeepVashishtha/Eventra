import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const SessionRecoveryContext = createContext();

const SESSION_KEY = 'eventra_session_state';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

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
  const saveTimeoutRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  // Check network connectivity
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

  // Track user activity for timeout
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [updateActivity]);

  // Load session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        
        // Check if session is still valid (not expired)
        if (now - parsed.timestamp < SESSION_TIMEOUT) {
          setSessionData(parsed);
          setHasSession(true);
          setShowRecoveryPrompt(true);
        } else {
          // Session expired, clear it
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  }, []);

  // Save session with debounce
  const saveSession = useCallback((state) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const currentSession = {
          ...state,
          timestamp: Date.now(),
          lastActivity: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
        setSessionData(currentSession);
        setHasSession(true);
      } catch (e) {
        console.error('Failed to save session:', e);
      }
    }, 1000); // Debounce for 1 second
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setSessionData(null);
      setHasSession(false);
      setShowRecoveryPrompt(false);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }, []);

  // Restore session
  const restoreSession = useCallback(() => {
    if (!sessionData) return null;
    return sessionData;
  }, [sessionData]);

  // Dismiss recovery prompt
  const dismissRecoveryPrompt = useCallback(() => {
    setShowRecoveryPrompt(false);
  }, []);

  // Handle tab close - save session
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasSession) {
        // Session is already being saved automatically
        // This is just a safety net
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasSession]);

  // Check for inactivity timeout
  useEffect(() => {
    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      
      // If inactive for more than session timeout, clear session
      if (inactiveTime > SESSION_TIMEOUT && hasSession) {
        clearSession();
      }
    };

    const interval = setInterval(checkInactivity, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity, hasSession, clearSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
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
