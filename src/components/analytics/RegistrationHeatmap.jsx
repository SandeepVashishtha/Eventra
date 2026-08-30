"use client";

import React, { useState } from "react";
import { Flame, Clock, Sparkles } from "lucide-react";

export default function RegistrationHeatmap({ heatmap = [] }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (!heatmap || heatmap.length === 0) {
    return (
      <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-500 text-xs">
        No hourly registration data recorded yet.
      </div>
    );
  }

  const timeSlotHeaders = [
    "12AM-4AM",
    "4AM-8AM",
    "8AM-12PM",
    "12PM-4PM",
    "4PM-8PM",
    "8PM-12AM",
  ];

  // Helper for background color intensity
  const getCellBg = (count) => {
    if (count === 0) return "bg-zinc-100/70 border-zinc-200/50 text-zinc-400";
    if (count < 6) return "bg-emerald-100/70 border-emerald-200 text-emerald-800";
    if (count < 14) return "bg-emerald-300/80 border-emerald-400 text-emerald-900 font-semibold";
    if (count < 22) return "bg-emerald-500 text-white font-bold";
    return "bg-[#009e74] text-white font-extrabold shadow-xs shadow-emerald-300";
  };

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                Peak Registration Times (Day of Week & Hour)
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Identify when users register most to optimize promotional campaigns & announcements
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium self-end sm:self-auto">
          <span>Less</span>
          <div className="w-3 h-3 rounded-xs bg-zinc-100 border border-zinc-200" />
          <div className="w-3 h-3 rounded-xs bg-emerald-100" />
          <div className="w-3 h-3 rounded-xs bg-emerald-300" />
          <div className="w-3 h-3 rounded-xs bg-emerald-500" />
          <div className="w-3 h-3 rounded-xs bg-[#009e74]" />
          <span>Peak</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[540px] space-y-2">
          {/* Header Row */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-zinc-500">
            <div className="text-left pl-2">Day</div>
            {timeSlotHeaders.map((header, idx) => (
              <div key={`header-${idx}`}>{header}</div>
            ))}
          </div>

          {/* Day Rows */}
          {heatmap.map((row, dayIdx) => (
            <div
              key={`day-row-${dayIdx}`}
              className="grid grid-cols-7 gap-2 items-center text-xs"
            >
              <div className="font-bold text-zinc-800 text-left pl-2">
                {row.day}
              </div>

              {row.slots.map((slot, slotIdx) => (
                <div
                  key={`cell-${dayIdx}-${slotIdx}`}
                  onMouseEnter={() =>
                    setHoveredCell({
                      day: row.day,
                      slotLabel: slot.slotLabel,
                      count: slot.count,
                    })
                  }
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer select-none relative group ${getCellBg(
                    slot.count
                  )}`}
                >
                  <span className="font-mono text-xs">{slot.count}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip & Recommendation Banner */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#00b887] shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          {hoveredCell ? (
            <div>
              <span className="font-bold text-zinc-900">
                {hoveredCell.day} ({hoveredCell.slotLabel}):
              </span>{" "}
              <span className="font-mono font-bold text-emerald-700">
                {hoveredCell.count} registrations
              </span>{" "}
              received during this window.
            </div>
          ) : (
            <div>
              <span className="font-bold text-zinc-900">Organizer Insight:</span>{" "}
              <span className="text-zinc-600">
                Peak registrations occur on <strong>Wednesdays and Thursdays between 12 PM - 8 PM</strong>. Schedule social media announcements and newsletters during these hours for maximum conversion.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
