import React, { useState } from "react";
import { Sparkles, Trophy } from "lucide-react";
import LevelUpModal from "./LevelUpModal";
import "./level-header.css";

export default function LevelHeader({ currentXp = 450, maxXp = 600, level = 4 }) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const percent = Math.round((currentXp / maxXp) * 100);

  const simulateXpGain = () => {
    setShowLevelUp(true);
  };

  return (
    <div className="level-header-wrapper w-full bg-slate-900 text-white p-4 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/10">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Level {level}</h4>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">Hacker Contributor</span>
          </div>
        </div>

        <div className="flex-1 max-w-md flex items-center gap-4">
          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden relative border border-slate-850 shadow-inner">
            <div
              style={{ width: `${percent}%` }}
              className="level-progress-bar h-full bg-indigo-500 rounded-full transition-all duration-700"
            />
          </div>
          <span className="text-xs font-bold text-slate-450 shrink-0">{currentXp} / {maxXp} XP</span>
        </div>

        <button
          onClick={simulateXpGain}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-slate-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Test Up
        </button>
      </div>

      {showLevelUp && <LevelUpModal newLevel={level + 1} onClose={() => setShowLevelUp(false)} />}
    </div>
  );
}
