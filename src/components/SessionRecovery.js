import { useState, useEffect, useRef } from 'react';
import { useSessionRecovery } from '../context/SessionRecoveryContext';
import { Wifi, WifiOff, RefreshCw, X, CheckCircle, AlertCircle } from 'lucide-react';

const SessionRecovery = () => {
  // 🔥 FIX: Added fallback empty object to prevent TypeError if context is missing in tests
  const {
    isOnline,
    isReconnecting,
    showRecoveryPrompt,
    restoreSession,
    dismissRecoveryPrompt,
    clearSession,
    sessionData,
  } = useSessionRecovery() || {};

  const [isRestoring, setIsRestoring] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const prevOnlineRef = useRef(isOnline);
  
  // 🔥 FIX: SSR Hydration guard to prevent Date.now() mismatches between server and client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setShowOnlineToast(true);
      const timer = setTimeout(() => {
        setShowOnlineToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      // 🔥 FIX: Added missing 'await' to prevent race conditions and dispatching raw Promises
      const session = await restoreSession?.();
      if (session) {
        // 🔥 FIX: Ensure window exists before dispatching (SSR safety)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sessionRestored', { detail: session }));
        }
        dismissRecoveryPrompt?.();
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDismiss = () => {
    clearSession?.();
    dismissRecoveryPrompt?.();
  };

  // 🔥 FIX: Do not render dynamic UI until hydration is complete to prevent SSR crashes
  if (!isMounted) return null;

  if (!isOnline && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <WifiOff size={20} className="animate-pulse" />
          <div>
            <p className="font-semibold text-sm">You&apos;re offline</p>
            <p className="text-xs opacity-90">Changes will be saved locally</p>
          </div>
        </div>
      </div>
    );
  }

  if (isReconnecting && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <RefreshCw size={20} className="animate-spin" />
          <div>
            <p className="font-semibold text-sm">Reconnecting...</p>
            <p className="text-xs opacity-90">Attempting to restore connection</p>
          </div>
        </div>
      </div>
    );
  }

  if (isOnline && showOnlineToast && !showRecoveryPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-[45] animate-slide-up">
        <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Wifi size={20} />
          <div>
            <p className="font-semibold text-sm">You&apos;re back online</p>
            <p className="text-xs opacity-90">Connection restored</p>
          </div>
        </div>
      </div>
    );
  }

  if (showRecoveryPrompt && sessionData) {
    const isValidTimestamp =
      sessionData &&
      sessionData.timestamp &&
      typeof sessionData.timestamp === 'number' &&
      !isNaN(sessionData.timestamp);

    if (!isValidTimestamp) return null;

    // 🔥 FIX: Added Math.max(0, ...) to prevent negative minutes if user's clock is skewed
    const timeSinceSession = Math.max(0, Math.floor(
      (Date.now() - sessionData.timestamp) / 1000 / 60
    ));

    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Resume where you left off?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                We found a session from {timeSinceSession === 0 ? 'just now' : `${timeSinceSession} minute${timeSinceSession > 1 ? 's' : ''} ago`}.
                Would you like to restore your previous activity?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isRestoring}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  aria-label="Restore the previous session"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Restore Session
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  aria-label="Start a fresh session"
                >
                  <X size={16} />
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionRecovery;