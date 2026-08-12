import React, { useState } from "react";
import { Download, CheckCircle, HardDrive, RefreshCw } from "lucide-react";
import {
  downloadEventPackForOffline,
  isEventDownloadedOffline,
  deleteOfflinePack,
} from "../../utils/storage/offlineCacheManager";

export default function OfflinePackDownloader({
  eventData = { id: "evt-2026-global", title: "Global Open Source Summit" },
}) {
  const [isDownloaded, setIsDownloaded] = useState(() =>
    isEventDownloadedOffline(eventData?.id)
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleToggleOffline = async () => {
    if (isDownloaded) {
      deleteOfflinePack(eventData.id);
      setIsDownloaded(false);
    } else {
      setIsDownloading(true);
      setProgress(10);
      await downloadEventPackForOffline(eventData, (p) => setProgress(p));
      setIsDownloading(false);
      setIsDownloaded(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleOffline}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
        isDownloaded
          ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
    >
      {isDownloading ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-white" />
          <span>Downloading Pack ({progress}%)</span>
        </>
      ) : isDownloaded ? (
        <>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Available Offline (Saved)</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Save for Offline Use</span>
        </>
      )}
    </button>
  );
}
