import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { normalizeDateToUTC } from "../../utils/calendarUtils.js";

export default function ServerRenderedCalendar({ serverDateUtc = "2026-08-11T00:00:00.000Z" }) {
  const [mounted, setMounted] = useState(false);

  // Defer user-local timezone checks to post-mount pass
  useEffect(() => {
    setMounted(true);
  }, []);

  const displayDate = mounted
    ? new Date(serverDateUtc).toLocaleDateString()
    : "Loading calendar date...";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      {/* Header Info Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Dynamic Server-Rendered Calendar</span>
        </div>

        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
          Two-Pass Hydration Safe
        </span>
      </div>

      {/* Date Card Grid */}
      <div className="p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-center space-y-2">
        <Clock className="w-8 h-8 text-indigo-500 mx-auto" />
        <h4 className="font-semibold text-gray-500">Scheduled Venue Time</h4>
        <h2 className="text-xl font-bold font-mono text-gray-950 dark:text-white">
          {displayDate}
        </h2>
      </div>
    </div>
  );
}
