import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export default function SkillRadarChart({
  data = [
    { skill: "Frontend", team: 90, applicant: 40 },
    { skill: "Backend", team: 85, applicant: 30 },
    { skill: "UI/UX", team: 15, applicant: 95 },
    { skill: "AI / ML", team: 10, applicant: 90 },
    { skill: "Pitch", team: 70, applicant: 60 },
  ],
}) {
  return (
    <div className="w-full h-64 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800">
      <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2 text-center">
        Skill Complementarity Radar
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <Radar name="Team Current" dataKey="team" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
          <Radar name="Applicant" dataKey="applicant" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
