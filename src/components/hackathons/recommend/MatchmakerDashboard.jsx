import React from "react";
import { Users, Compass } from "lucide-react";
import TeamCompatibilityCard from "./TeamCompatibilityCard";

export default function MatchmakerDashboard() {
  const recommendations = [
    { partner: "Sonia", score: 94 },
    { partner: "Rohan", score: 87 }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Hackathon Team Matchmaker
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, idx) => (
          <TeamCompatibilityCard key={idx} partner={rec.partner} score={rec.score} />
        ))}
      </div>
    </div>
  );
}
