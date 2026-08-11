import { useState, useEffect } from "react";
import { OfflineStorageQueue } from "../utils/offlineStorage";

export default function useOfflineSync() {
  const [queue] = useState(() => new OfflineStorageQueue());
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState("IDLE");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncStatus("SYNCING");
      // Trigger background sync task
      await new Promise((res) => setTimeout(res, 500));
      setSyncStatus("SUCCESS");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("OFFLINE_QUEUED");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return {
    queue,
    isOnline,
    syncStatus,
  };
}
