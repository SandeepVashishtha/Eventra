import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi, X } from "lucide-react";
import { useOfflineStatus } from "../../hooks/useOfflineStatus";

/**
 * OfflineIndicator
 *
 * Renders a non-intrusive sticky banner at the top of the screen when the
 * user is offline, and a brief "back online" confirmation when connectivity
 * is restored. Dismissed manually by the user or auto-hides after 4 s once
 * back online.
 *
 * Does NOT attempt any sync, mutation, or data replay — intentionally dumb
 * and presentational only.
 */
const OfflineIndicator = () => {
  const isOffline = useOfflineStatus();
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [prevOffline, setPrevOffline] = useState(isOffline);

  // Detect transition from offline → online
  useEffect(() => {
    if (prevOffline && !isOffline) {
      setShowBackOnline(true);
      setDismissed(false);
      const timer = setTimeout(() => setShowBackOnline(false), 4000);
      return () => clearTimeout(timer);
    }
    if (isOffline) {
      setDismissed(false); // re-show if they go offline again after dismissing
    }
    setPrevOffline(isOffline);
  }, [isOffline, prevOffline]);

  const visible = (isOffline && !dismissed) || showBackOnline;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={isOffline ? "offline" : "online"}
          initial={{ opacity: 0, y: -48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -48 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: "1rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "max-content",
            maxWidth: "calc(100vw - 2rem)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.625rem 1.125rem",
              borderRadius: "999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              backdropFilter: "blur(12px)",
              border: isOffline
                ? "1px solid rgba(239,68,68,0.3)"
                : "1px solid rgba(16,185,129,0.3)",
              background: isOffline ? "rgba(30,0,0,0.82)" : "rgba(0,30,18,0.82)",
              color: isOffline ? "#fca5a5" : "#6ee7b7",
              userSelect: "none",
            }}
          >
            {isOffline ? (
              <WifiOff size={15} style={{ flexShrink: 0 }} />
            ) : (
              <Wifi size={15} style={{ flexShrink: 0 }} />
            )}

            <span>
              {isOffline
                ? "You're offline — tickets & cached data are available"
                : "Back online — content will refresh automatically"}
            </span>

            {isOffline && (
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss offline notice"
                style={{
                  marginLeft: "0.25rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  opacity: 0.7,
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
