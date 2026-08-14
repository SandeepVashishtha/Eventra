import React from "react";

export default function ReactionBadge({ reaction, onClick }) {
  return (
    <button
      onClick={onClick}
      className="reaction-badge flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700 transition-colors active:scale-95"
    >
      <span>{reaction.emoji}</span>
      <span className="text-slate-400 font-bold">{reaction.count}</span>
    </button>
  );
}
