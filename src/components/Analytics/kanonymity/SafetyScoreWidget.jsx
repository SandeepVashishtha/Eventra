import React from "react";
import { EyeOff } from "lucide-react";

export default function SafetyScoreWidget({ suppressedCount = 0, totalCount = 1, kVal = 3 }) {
  const safetyPercentage = totalCount > 0 ? Math.max(0, 100 - (suppressedCount / totalCount) * 100) : 100;

  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex flex-col justify-center text-center">
      <div className="mx-auto p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <EyeOff className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-gray-500">GDPR Compliance Score</h4>
      <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
        {safetyPercentage.toFixed(0)}%
      </div>
      <p className="text-[10px] text-gray-400">
        Suppressed {suppressedCount} records representing outliers below the k={kVal} safety threshold.
      </p>
    </div>
  );
}
