import React from "react";
import { Check } from "lucide-react";

export default function AltTagPreview({ tags = [] }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 text-xs space-y-3">
      <h4 className="font-bold text-gray-500">Inferred Alternative Tag Keywords</h4>

      <div className="space-y-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 text-gray-900 dark:text-white">
            <span className="font-semibold">{tag.label}</span>
            <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
              {(tag.confidence * 100).toFixed(0)}% Match
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
