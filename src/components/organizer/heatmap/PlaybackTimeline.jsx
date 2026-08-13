import React, { useState } from "react";
import { Play, Pause, Calendar } from "lucide-react";

export default function PlaybackTimeline() {
  const [playing, setPlaying] = useState(false);
  const [timeIndex, setTimeIndex] = useState(12);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-900 dark:text-white">
      <button
        onClick={() => setPlaying(!playing)}
        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>08:00 AM</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">Current View: {timeIndex}:00 PM</span>
          <span>08:00 PM</span>
        </div>
        <input
          type="range"
          min="8"
          max="20"
          value={timeIndex}
          onChange={(e) => setTimeIndex(Number(e.target.value))}
          className="w-full h-1 bg-slate-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
    </div>
  );
}
