import React from "react";
import { Sparkles } from "lucide-react";

export default function SkillRadarChart({ skills = [80, 60, 90] }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-2 flex flex-col justify-center text-center">
      <div className="mx-auto p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <Sparkles className="w-4 h-4" />
      </div>
      <h4 className="font-bold text-gray-500">Skills Match Matrix</h4>
      <div className="flex gap-1 justify-center">
        {skills.map((score, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-3 bg-indigo-550 rounded" style={{ height: `${score * 0.4}px` }} />
            <span className="text-[8px] mt-1 text-gray-400">S{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
