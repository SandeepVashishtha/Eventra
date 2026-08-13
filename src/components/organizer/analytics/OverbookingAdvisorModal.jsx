import React from "react";
import { TrendingUp, CheckCircle, AlertTriangle, X } from "lucide-react";

export default function OverbookingAdvisorModal({
  stats = {
    totalRegistered: 200,
    predictedTurnout: 142,
    predictedNoShows: 58,
    turnoutPercentage: 71,
    recommendedOverbookingCapacity: 246,
  },
  isOpen = false,
  onClose = () => {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-gray-900 dark:text-white select-none">
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Waitlist & Over-booking Advisor</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 text-center">
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
            Recommended Over-booking Quota
          </span>
          <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {stats.recommendedOverbookingCapacity} Registrations
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            (+{stats.recommendedOverbookingCapacity - stats.totalRegistered} seats over venue limit based on predicted {stats.predictedNoShows} no-shows)
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-gray-500">Current Venue Capacity Limit:</span>
            <span className="font-bold font-mono">{stats.totalRegistered} Seats</span>
          </div>
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-gray-500">ML Predicted Actual Turnout:</span>
            <span className="font-bold font-mono text-emerald-600">{stats.predictedTurnout} Attendees ({stats.turnoutPercentage}%)</span>
          </div>
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-gray-500">Expected Empty Venue Seats:</span>
            <span className="font-bold font-mono text-rose-500">{stats.predictedNoShows} Empty Seats</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Overbooking ensures 100% seat utilization for free community hackathons without exceeding venue safety limits.</span>
        </div>
      </div>
    </div>
  );
}
