import { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { getQueue } from "../../utils/offlineQueue";
import "./OfflineBanner.css";

export default function OfflineBanner() {
  const [status, setStatus] = useState(navigator.onLine ? "online" : "offline");
  const [visible, setVisible] = useState(!navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [syncSummary, setSyncSummary] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => {
      setStatus("online");
      setSyncSummary("");
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    const handleOffline = () => {
      setStatus("offline");
      setSyncSummary("");
      setVisible(true);
    };

    const handleQueueUpdated = () => {
      setQueueCount(getQueue().length);
      setVisible(true);
    };

    const handleQueueProcessed = (e) => {
      const { succeeded, dropped, remaining } = e.detail;
      setQueueCount(remaining);
      if (dropped > 0) {
        setSyncSummary(
          `${dropped} queued action(s) could not be synced. ${succeeded} action(s) synced successfully.`,
        );
        setVisible(true);
      } else {
        setSyncSummary(
          succeeded > 0 ? `${succeeded} queued action(s) synced successfully.` : "",
        );
      }
      if (remaining === 0 && dropped === 0) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 4000);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("eventra-offline-queue-updated", handleQueueUpdated);
    window.addEventListener("eventra-offline-queue-processed", handleQueueProcessed);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("eventra-offline-queue-updated", handleQueueUpdated);
      window.removeEventListener("eventra-offline-queue-processed", handleQueueProcessed);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`offline-banner-container ${status}`}>
      <div className="offline-banner-content">
        {status === "offline" ? (
          <>
            <WifiOff className="offline-banner-icon animate-pulse text-rose-400" size={16} />
            <span>
              Operating offline. {queueCount > 0 ? `${queueCount} action(s) queued for sync.` : "Form submissions will be queued."}
            </span>
          </>
        ) : (
          <>
            <Wifi className="offline-banner-icon text-emerald-400" size={16} />
            <span>
              {syncSummary ||
                (queueCount > 0
                  ? `Synchronizing ${queueCount} queued action(s)...`
                  : "Connection restored! Offline cache is ready.")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
