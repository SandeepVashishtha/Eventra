import React from "react";
import { Sparkles, Plus } from "lucide-react";

export default function ProfileCard({ profile, onInvite }) {
  return (
    <div className="profile-match-card bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{profile.name}</h3>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 block mt-1">{profile.role}</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 rounded-full">
            {profile.experience}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.skills.map((skill) => (
            <span key={skill} className="text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={onInvite}
        className="w-full flex items-center justify-center gap-1.5 bg-slate-150 hover:bg-indigo-600 dark:bg-slate-900 hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs py-2 rounded-xl transition-all border border-transparent hover:border-indigo-500"
      >
        <Plus className="w-3.5 h-3.5" /> Invite to Team
      </button>
    </div>
  );
}
