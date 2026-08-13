import React, { useState } from "react";
import { Users, FileDown, HelpCircle } from "lucide-react";
import DownloadProgressBar from "./DownloadProgressBar";

export default function PeerFileTransferPanel({ fileName = "brochure.pdf", totalSize = "4.2 MB" }) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startP2PDownload = () => {
    setDownloading(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setDownloading(false);
      }
    }, 150);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">WebRTC P2P Brochure Swarm</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
          6 Peers Online
        </span>
      </div>

      <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-gray-900/50 flex items-center justify-between">
        <div>
          <h4 className="font-semibold">{fileName}</h4>
          <span className="text-[10px] text-gray-400">{totalSize}</span>
        </div>
        <button
          onClick={startP2PDownload}
          disabled={downloading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          {downloading ? "Downloading..." : "Start P2P Get"}
        </button>
      </div>

      {downloading && <DownloadProgressBar progress={progress} />}
    </div>
  );
}
