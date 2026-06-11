import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdateAvailableBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.registration) {
        setRegistration(e.detail.registration);
      }
      setUpdateAvailable(true);
    };

    window.addEventListener("sw-update-available", handler);

    return () => {
      window.removeEventListener("sw-update-available", handler);
    };
  }, []);

  const handleRefresh = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    
    // Listen for the new active service worker and reload
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });

    // Fallback reload if controllerchange doesn't fire within 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-white shadow-lg">
      <span className="text-sm font-medium">New version available!</span>
      <button
        onClick={handleRefresh}
        className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
      >
        <RefreshCw size={14} />
        Refresh
      </button>
      <button
        onClick={handleDismiss}
        className="text-white/80 transition-colors hover:text-white"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
