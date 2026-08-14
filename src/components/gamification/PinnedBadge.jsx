import React from "react";
import { Star, ShieldAlert } from "lucide-react";

export default function PinnedBadge({ badge, onPin }) {
  return (
    <div className={`badge-card p-4 rounded-2xl border transition-all ${
      badge.pinned
        ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 text-slate-800 dark:text-slate-100"
        : "border-slate-200 dark:border-slate-850 hover:bg-slate-50"
    }`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-3xl select-none">{badge.icon}</span>
        <button
          onClick={onPin}
          className={`p-1.5 rounded-lg border transition-colors ${
            badge.pinned
              ? "bg-indigo-600 border-indigo-500 text-white"
              : "hover:bg-slate-200 border-slate-200 dark:border-slate-800 text-slate-400"
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      <h4 className="text-xs font-bold leading-tight">{badge.name}</h4>
      <p className="text-[10px] text-slate-400 mt-1 leading-normal">{badge.desc}</p>
    </div>
  );
}
