import React from "react";
import { RefreshCw } from "lucide-react";

export default function QrCountdownTimer({ secondsLeft = 15, maxSeconds = 15 }) {
  const percent = Math.round((secondsLeft / maxSeconds) * 100);
  const strokeDashoffset = 100 - percent;

  return (
    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
      <div className="relative w-7 h-7 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200 dark:text-gray-800"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000"
            strokeDasharray="100, 100"
            strokeDashoffset={strokeDashoffset}
            strokeWidth="4"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute font-mono text-[10px] font-bold">{secondsLeft}s</span>
      </div>
      <span className="flex items-center gap-1 text-[11px] text-gray-500">
        <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" /> Auto-rotating QR
      </span>
    </div>
  );
}
