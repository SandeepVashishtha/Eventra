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
          className="fixed top-20 right-0 left-0 z-[999] flex justify-center px-4"
        >
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
            <WifiOff size={16} className="shrink-0" aria-hidden="true" />
            <span className="flex-1">You&apos;re offline. Some features may not work.</span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-white/20 px-3 py-1 text-xs font-bold transition-colors hover:bg-white/30"
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
          className="fixed top-20 right-0 left-0 z-[999] flex justify-center px-4"
        >
          <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
            <Wifi size={16} className="shrink-0" aria-hidden="true" />
            <span>You&apos;re back online!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
