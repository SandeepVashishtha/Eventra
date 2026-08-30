"use client";

import React from "react";
import { UserCheck, Users, UserX, Award, CheckCircle } from "lucide-react";

export default function AttendanceGauge({
  totalRegistered = 0,
  checkedIn = 0,
  attendanceRate = 0,
}) {
  const radius = 64;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const normalizedRate = Math.min(100, Math.max(0, attendanceRate));
  const strokeDashoffset = circumference - (normalizedRate / 100) * circumference;

  const noShowCount = Math.max(0, totalRegistered - checkedIn);

  const getHealthBadge = (rate) => {
    if (rate >= 80) return { label: "Excellent Turnout", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (rate >= 60) return { label: "Healthy Attendance", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (rate >= 40) return { label: "Moderate Attendance", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Low Turnout", color: "bg-red-100 text-red-800 border-red-300" };
  };

  const badge = getHealthBadge(normalizedRate);

  return (
    <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00b887] border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900">
                Attendance Rate
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Actual verified check-ins vs registered attendees
              </p>
            </div>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Radial Gauge & Center Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#e4e4e7"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#00b887"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Centered Percentage */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-zinc-900 tracking-tight font-mono">
              {normalizedRate}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Turnout
            </span>
          </div>
        </div>

        {/* Detailed Breakdown stats */}
        <div className="w-full space-y-3">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <CheckCircle className="w-4 h-4 text-[#00b887]" />
              <span>Checked-in Attendees</span>
            </div>
            <span className="font-mono font-black text-sm text-[#00b887]">
              {checkedIn}
            </span>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-zinc-700">
              <Users className="w-4 h-4 text-zinc-500" />
              <span>Total Registrations</span>
            </div>
            <span className="font-mono font-black text-sm text-zinc-900">
              {totalRegistered}
            </span>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-semibold text-zinc-600">
              <UserX className="w-4 h-4 text-zinc-400" />
              <span>Pending / No-Show</span>
            </div>
            <span className="font-mono font-bold text-sm text-zinc-500">
              {noShowCount}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-zinc-400 font-medium text-center pt-1 border-t border-zinc-100">
        Formula: <code className="text-zinc-600 font-mono">(checked_in / total_registered) * 100</code>
      </div>
    </div>
  );
}
