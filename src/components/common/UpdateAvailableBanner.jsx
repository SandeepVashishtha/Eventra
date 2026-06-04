import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdateAvailableBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handler = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener("sw-update-available", handler);

    return () => {
      window.removeEventListener("sw-update-available", handler);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg">
      <span className="text-sm font-medium">New version available!</span>
      <button
        onClick={handleRefresh}
        className="flex items-center gap-1.5 bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
      >
        <RefreshCw size={14} />
        Refresh
      </button>
      <button
        onClick={handleDismiss}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}
