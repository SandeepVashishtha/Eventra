import React from "react";
import { Calendar, AlertTriangle } from "lucide-react";

export default function TimeTimelineGrid({ tracks = [] }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white select-none">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">Multi-Track Timetable Grid</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((track, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 space-y-3">
            <h3 className="font-bold text-gray-500">{track.name}</h3>
            {track.sessions.map((sess, sIdx) => (
              <div key={sIdx} className="p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{sess.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {sess.start}:00 - {sess.end}:00
                  </span>
                </div>
                {sess.hasOverlap && (
                  <span className="flex items-center gap-1 text-rose-500 font-bold font-mono text-[9px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                    <AlertTriangle className="w-3 h-3" /> Overlap Detected
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
