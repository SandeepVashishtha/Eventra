import React from "react";

export default function RotationProgressBar({ duration = 15, timeLeft = 15 }) {
  const percentage = (timeLeft / duration) * 100;
  return (
    <div className="space-y-1 text-left">
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>Rotating key</span>
        <span>{timeLeft}s remaining</span>
      </div>
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
