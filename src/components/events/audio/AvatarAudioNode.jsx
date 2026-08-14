import React from "react";

export default function AvatarAudioNode({ label = "", x = 0, y = 0, highlight = false }) {
  return (
    <div
      className={`absolute w-8 h-8 rounded-full flex items-center justify-center font-bold text-[9px] text-white shadow-lg transition-all duration-300 ${
        highlight ? "bg-indigo-600 border border-indigo-400" : "bg-slate-700 border border-slate-500"
      }`}
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {label}
    </div>
  );
}
