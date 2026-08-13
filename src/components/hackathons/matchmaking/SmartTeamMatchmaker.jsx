import React, { useState } from "react";
import { Sparkles, Users, UserPlus } from "lucide-react";
import SkillRadarChart from "./SkillRadarChart";
import CompatibilityScoreCard from "./CompatibilityScoreCard";

const MATCH_RECOMMENDATIONS = [
  {
    name: "Alex Rivera",
    role: "UI/UX & AI Engineer",
    matchPercentage: 94,
    skillTags: ["UI/UX Gap", "AI/ML Gap"],
  },
  {
    name: "Sarah Chen",
    role: "Full-Stack & DevOps Specialist",
    matchPercentage: 88,
    skillTags: ["Docker Deployment Gap"],
  },
];

export default function SmartTeamMatchmaker() {
  const [invited, setInvited] = useState([]);

  const handleInvite = (name) => {
    if (!invited.includes(name)) {
      setInvited([...invited, name]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Autonomous AI Hackathon Team Matchmaker
          </h2>
        </div>

        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
          Vector-Space Skill Delta Algorithm Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Radar Chart Column */}
        <div className="md:col-span-1">
          <SkillRadarChart />
        </div>

        {/* Recommended Matches List */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">
            Top Complementary Solo Applicants for Your Team
          </h3>
          {MATCH_RECOMMENDATIONS.map((app, idx) => (
            <CompatibilityScoreCard
              key={idx}
              applicant={app}
              onInvite={handleInvite}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
