import React from "react";
import { Shield, Award, Users } from "lucide-react";
import "./leaderboard-card.css";

export default function HackerLeaderboardCard({ hacker = {
  name: "Sandeep V.",
  rank: 1,
  level: 8,
  points: 1200,
  avatar: "https://avatars.githubusercontent.com/u/64915843?v=4"
}}) {
  return (
    <div className="hacker-leaderboard-card p-6 bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-xl max-w-sm mx-auto my-8 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <img src={hacker.avatar} alt={hacker.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-700" />
          <div>
            <h4 className="text-sm font-bold leading-tight">{hacker.name}</h4>
            <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> GSSoC Contributor
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-indigo-400">Rank #{hacker.rank}</span>
          <span className="text-[9px] text-slate-450 uppercase font-bold mt-0.5">Overall</span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4">
        <div className="flex items-center gap-1 text-xs">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Level {hacker.level}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-black text-indigo-400">
          <Award className="w-4 h-4 text-yellow-500" />
          <span>{hacker.points} Points</span>
        </div>
      </div>
    </div>
  );
}
