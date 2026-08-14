import React, { useState } from "react";
import { Lock, Check, Circle } from "lucide-react";

export default function QuestNode({ quest }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusStyle = () => {
    if (quest.completed) return "bg-emerald-500 text-white border-emerald-400";
    if (quest.unlocked) return "bg-indigo-600 text-white border-indigo-400";
    return "bg-slate-200 text-slate-400 border-slate-300 dark:bg-slate-800 dark:border-slate-700";
  };

  return (
    <div
      style={{ left: quest.x, top: quest.y }}
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95 ${getStatusStyle()}`}>
        {quest.completed ? (
          <Check className="w-5 h-5" />
        ) : quest.unlocked ? (
          <Circle className="w-3 h-3 fill-current" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
      </div>

      {showTooltip && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs w-48 z-10 pointer-events-none">
          <h4 className="font-bold mb-1">{quest.label}</h4>
          <p className="text-[10px] text-slate-450 leading-relaxed">{quest.desc}</p>
        </div>
      )}
    </div>
  );
}
