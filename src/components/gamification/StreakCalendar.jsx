import React from "react";
import { Flame, Star } from "lucide-react";
import StreakFireIcon from "./StreakFireIcon";
import "./streak.css";

export default function StreakCalendar({ currentStreak = 5 }) {
  // Generate dummy monthly blocks
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    active: i < currentStreak,
    quest: i === 2 || i === 4
  }));

  return (
    <div className="streak-calendar p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-sm mx-auto my-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Flame className="text-orange-500 fill-current w-5 h-5" />
          Hacker Daily Streak
        </h3>
        <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/20 text-orange-655 dark:text-orange-400 px-3 py-1 rounded-xl font-black text-sm">
          {currentStreak} Days
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((d) => (
          <div
            key={d.day}
            className={`day-box relative aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all border ${
              d.active
                ? "bg-orange-500 border-orange-400 text-white shadow-md shadow-orange-500/10"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-450 hover:bg-slate-100"
            }`}
          >
            {d.day}
            {d.quest && (
              <span className="absolute -top-1 -right-1 p-0.5 bg-yellow-500 text-white rounded-full">
                <Star className="w-2 h-2 fill-current" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
