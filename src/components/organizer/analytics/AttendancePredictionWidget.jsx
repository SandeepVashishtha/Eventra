import React, { useState } from "react";
import { Users, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { predictEventTurnout } from "../../../utils/attendancePrediction";
import OverbookingAdvisorModal from "./OverbookingAdvisorModal";

const SAMPLE_REGISTRATIONS = [
  { id: 1, name: "Alex Rivera", pastAttendanceRatio: 0.95, daysRegisteredBeforeEvent: 20, profileCompleteness: 100, badgeCount: 5, isLocalResident: true },
  { id: 2, name: "Sarah Chen", pastAttendanceRatio: 0.85, daysRegisteredBeforeEvent: 14, profileCompleteness: 90, badgeCount: 3, isLocalResident: true },
  { id: 3, name: "Marcus Vance", pastAttendanceRatio: 0.30, daysRegisteredBeforeEvent: 2, profileCompleteness: 40, badgeCount: 0, isLocalResident: false },
  { id: 4, name: "Elena Rostova", pastAttendanceRatio: 0.75, daysRegisteredBeforeEvent: 10, profileCompleteness: 80, badgeCount: 2, isLocalResident: true },
];

export default function AttendancePredictionWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = predictEventTurnout(SAMPLE_REGISTRATIONS);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Predictive ML Turnout Engine
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No-Show Risk & Attendee Attendance Analytics
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm"
        >
          <TrendingUp className="w-4 h-4" /> Overbooking Advisor
        </button>
      </div>

      {/* Main Gauge Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 space-y-1">
          <span className="text-xs text-gray-500 font-medium">Total Registered</span>
          <h4 className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalRegistered}</h4>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">Predicted Actual Turnout</span>
          <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {stats.predictedTurnout} ({stats.turnoutPercentage}%)
          </h4>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
          <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">Predicted No-Shows</span>
          <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {stats.predictedNoShows}
          </h4>
        </div>
      </div>

      {/* Overbooking Advisor Modal */}
      <OverbookingAdvisorModal
        stats={stats}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
