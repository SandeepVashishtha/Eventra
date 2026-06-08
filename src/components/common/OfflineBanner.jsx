import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRestoredMsg, setShowRestoredMsg] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredMsg(true);
      setTimeout(() => setShowRestoredMsg(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredMsg(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="alert"
          aria-live="assertive"
          className="fixed top-20 left-0 right-0 z-[999] flex justify-center px-4"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-600 text-white shadow-lg text-sm font-semibold max-w-md w-full">
            <WifiOff size={16} className="shrink-0" aria-hidden="true" />
            <span className="flex-1">You're offline. Some features may not work.</span>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-bold"
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {showRestoredMsg && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className="fixed top-20 left-0 right-0 z-[999] flex justify-center px-4"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-600 text-white shadow-lg text-sm font-semibold max-w-md w-full">
            <Wifi size={16} className="shrink-0" aria-hidden="true" />
            <span>You're back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;