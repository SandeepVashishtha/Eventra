import React from "react";

export default function DownloadProgressBar({ progress = 0 }) {
  return (
    <div className="w-full space-y-1.5 text-xs text-gray-900 dark:text-white">
      <div className="flex justify-between font-mono text-[10px] text-gray-400">
        <span>Chunk Assembly Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
