import React, { useState } from "react";
import { Users, UserPlus } from "lucide-react";
import SkillRadarChart from "./SkillRadarChart";

export default function SmartTeamMatchmaker() {
  const [candidates, setCandidates] = useState([
    { name: "John (Backend)", score: 95 },
    { name: "Alice (UI Dev)", score: 88 }
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Skill Matching Partner Recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          {candidates.map((c, i) => (
            <div key={i} className="p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-between items-center">
              <span className="font-semibold">{c.name}</span>
              <button className="flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
                <UserPlus className="w-3 h-3" /> Invite Partner
              </button>
            </div>
          ))}
        </div>

        <SkillRadarChart />
      </div>
    </div>
  );
}
