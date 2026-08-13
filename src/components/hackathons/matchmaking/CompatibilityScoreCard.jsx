import React from "react";
import { Sparkles, CheckCircle2, UserPlus, AlertCircle } from "lucide-react";

export default function CompatibilityScoreCard({
  applicant = {
    name: "Alex Rivera",
    role: "UI/UX & AI Engineer",
    matchPercentage: 92,
    skillTags: ["Needs UI/UX", "Needs AI/ML"],
  },
  onInvite = () => {},
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 text-xs">
      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {applicant.name}
          </span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {applicant.matchPercentage}% AI Match
          </span>
        </div>

        <p className="text-gray-500">{applicant.role}</p>

        <div className="flex flex-wrap gap-1 pt-1">
          {applicant.skillTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold"
            >
              ✓ Fills {tag}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => onInvite(applicant.name)}
        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm transition-all shrink-0"
      >
        <UserPlus className="w-4 h-4" /> Invite to Squad
      </button>
    </div>
  );
}
