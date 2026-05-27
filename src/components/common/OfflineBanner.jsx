import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import "./OfflineBanner.css";

export default function OfflineBanner() {
  const [status, setStatus] = useState(navigator.onLine ? "online" : "offline");
  const [visible, setVisible] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setStatus("online");
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setStatus("offline");
      setVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`offline-banner-container ${status}`}>
      <div className="offline-banner-content">
        {status === "offline" ? (
          <>
            <WifiOff className="offline-banner-icon animate-pulse text-rose-400" size={16} />
            <span>Operating offline. Form submissions will cache in IndexedDB secure draft store.</span>
          </>
        ) : (
          <>
            <Wifi className="offline-banner-icon text-emerald-400" size={16} />
            <span>Connection restored! Synchronizing your offline draft queue...</span>
          </>
        )}
      </div>
    </div>
  );
}
