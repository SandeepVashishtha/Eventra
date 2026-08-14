import React from "react";
import { CheckSquare, Square } from "lucide-react";

export default function AttendeeRow({ attendee, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`attendee-row flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
        attendee.checkedIn
          ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-100"
          : "border-slate-200 dark:border-slate-850 hover:bg-slate-50"
      }`}
    >
      <div>
        <h4 className="text-xs font-bold leading-tight">{attendee.name}</h4>
        <span className="text-[10px] text-slate-400 mt-0.5 block">{attendee.email}</span>
      </div>

      <div>
        {attendee.checkedIn ? (
          <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-450" />
        ) : (
          <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
        )}
      </div>
    </div>
  );
}
