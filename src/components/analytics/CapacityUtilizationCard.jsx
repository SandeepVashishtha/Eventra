"use client";

import React from "react";
import { Users, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

export default function CapacityUtilizationCard({
  totalRegistered = 0,
  maxCapacity = 0,
  capacityUtilization = 0,
  seatsRemaining = 0,
  isSoldOut = false,
}) {
  const normalizedUtil = Math.min(100, Math.max(0, capacityUtilization));

  const getProgressColor = (util) => {
    if (util >= 100) return "bg-red-500";
    if (util >= 85) return "bg-amber-500";
    return "bg-[#00b887]";
  };

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                Capacity Utilization
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Registered attendees vs venue / platform limit
              </p>
            </div>
          </div>
        </div>

        {isSoldOut ? (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-extrabold border border-red-300 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            <span>Venue Full</span>
          </span>
        ) : normalizedUtil >= 85 ? (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Near Capacity</span>
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00b887]" />
            <span>Seats Available</span>
          </span>
        )}
      </div>

      {/* Progress Bar & Indicators */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 font-mono">
              {totalRegistered}
            </span>
            <span className="text-xs font-bold text-zinc-400">
              / {maxCapacity} Max Capacity
            </span>
          </div>
          <span className="text-xl font-black text-emerald-700 font-mono">
            {normalizedUtil}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
              normalizedUtil
            )}`}
            style={{ width: `${normalizedUtil}%` }}
          />
        </div>
      </div>

      {/* Seats Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Remaining Seats
          </div>
          <div className="text-lg font-black text-zinc-900 font-mono">
            {seatsRemaining}
          </div>
        </div>

        <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-0.5">
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Waitlist Status
          </div>
          <div className="text-lg font-bold text-zinc-700">
            {isSoldOut ? "Active (14 queued)" : "Disabled"}
          </div>
        </div>
      </div>
    </div>
  );
}
