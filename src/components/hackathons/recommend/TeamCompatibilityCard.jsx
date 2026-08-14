import React from "react";
import { Sparkles } from "lucide-react";

export default function TeamCompatibilityCard({ partner = "Alex", score = 92 }) {
  return (
    <div className="p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-between items-center text-xs">
      <span className="font-semibold text-gray-800 dark:text-white flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Teammate candidate: {partner}
      </span>
      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
        {score}% Match
      </span>
    </div>
  );
}
