import React from "react";
import { Lock, Edit, Check } from "lucide-react";

export default function TimeSlot({ slot, onEdit }) {
  return (
    <div className={`time-slot-card p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
      slot.lockedBy
        ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 opacity-70"
        : "bg-white dark:bg-slate-950 border-slate-250 dark:border-slate-850 hover:shadow-sm hover:border-indigo-500"
    }`}>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
            {slot.start} - {slot.end}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
            {slot.room}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
          {slot.title}
        </h4>
        <p className="text-xs text-slate-500 mt-1">Speaker: {slot.speaker}</p>
      </div>

      <div className="flex items-center gap-3">
        {slot.lockedBy ? (
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-450 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            Locked by {slot.lockedBy}
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 bg-slate-100 hover:bg-indigo-650 dark:bg-slate-900 hover:text-white text-slate-700 dark:text-slate-300 border border-transparent hover:border-indigo-500 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Slot
          </button>
        )}
      </div>
    </div>
  );
}
