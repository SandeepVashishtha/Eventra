import React from "react";
import { Sparkles } from "lucide-react";

export default function OptimalSlotSelector({ recommendations = [] }) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="font-bold text-indigo-900 dark:text-indigo-300">Optimal Slot Recommendations</span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex justify-between items-center text-gray-900 dark:text-white">
            <span className="font-semibold">{rec.title}</span>
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
              Score: {rec.score}/100 ({rec.bestStart}:00 - {rec.bestEnd}:00)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
