import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Fix: Import centralised useNetworkStatus hook instead of duplicating
// navigator.onLine + event listener boilerplate that previously existed
// in 5 separate components.
import useNetworkStatus from "../../hooks/useNetworkStatus";

/**
 * OfflineBanner
 *
 * Displays a fixed banner when the user loses or regains network connectivity.
 *
 * Accessibility improvements:
 * - A persistent sr-only aria-live="assertive" region announces connectivity
 *   changes to screen readers even while the banner is animating in/out.
 * - aria-atomic="true" ensures the whole message is re-read on updates.
 * - The "Try Again" button has a descriptive aria-label.
 * - Decorative icons are aria-hidden.
 */
const OfflineBanner = () => {
  // Replace 4 useState + 2 useEffect blocks with a single hook call.
  // offlineDuration is now formatted with hours support (e.g. "1h 3m 22s")
  // which the previous inline implementation did not handle.
  const { isOnline, offlineDuration, wasOffline } = useNetworkStatus();

  const [showRestoredMsg, setShowRestoredMsg] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [syncSummary, setSyncSummary] = useState(null);

  // Show "back online" banner whenever we transition from offline → online
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestoredMsg(true);
      setLiveMessage("Connection restored. You are back online.");
      const timer = setTimeout(() => setShowRestoredMsg(false), 3000);
      return () => clearTimeout(timer);
    }
    if (!isOnline) {
      setShowRestoredMsg(false);
      setLiveMessage("Connection lost. You are offline. Some features may not work.");
    }
  }, [isOnline, wasOffline]);

  useEffect(() => {
    const handleQueueProcessed = (e) => {
      const summary = e?.detail || {};
      setSyncSummary(summary);
      if (summary.succeeded !== undefined) {
        let msg = `Sync completed: ${summary.succeeded} succeeded.`;
        if (summary.dropped > 0) {
          msg += ` ${summary.dropped} queued action(s) could not be synced.`;
        }
        setLiveMessage(msg);
      }
    };
    window.addEventListener("eventra-offline-queue-processed", handleQueueProcessed);
    return () => window.removeEventListener("eventra-offline-queue-processed", handleQueueProcessed);
  }, []);

  return (
    <>
      {/* Persistent sr-only live region — announced by screen readers
          independently of the visual banner animation timeline */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="alert"
            aria-live="assertive"
            className="fixed top-20 left-0 right-0 z-toast flex justify-center px-4"
          >
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-600 text-white shadow-lg text-sm font-semibold max-w-md w-full">
              <WifiOff size={16} className="shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <div>You&apos;re offline. Some features may not work.</div>
                <div className="text-xs opacity-90">
                  Offline for: {offlineDuration}
                </div>
              </div>
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
            className="fixed top-20 left-0 right-0 z-toast flex justify-center px-4"
          >
            <div className="flex flex-col gap-1 px-5 py-3 rounded-2xl bg-green-600 text-white shadow-lg text-sm font-semibold max-w-md w-full">
              <div className="flex items-center gap-3">
                <Wifi size={16} className="shrink-0" aria-hidden="true" />
                <span>You&apos;re back online!</span>
              </div>
              {syncSummary && (
                <div className="text-xs opacity-90 pl-7">
                  Sync completed: {syncSummary.succeeded} succeeded
                  {syncSummary.dropped > 0 && (
                    <span>, {syncSummary.dropped} queued action(s) could not be synced</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfflineBanner;
