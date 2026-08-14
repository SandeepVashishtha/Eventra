import React from "react";
import { ArrowUp } from "lucide-react";

export default function ProjectCard({ project, onVote }) {
  return (
    <div className="project-upvote-card bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-60">
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">{project.title}</h3>
        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed line-clamp-3">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {project.tech.map((tag) => (
            <span key={tag} className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-400 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 border-t border-slate-100 dark:border-slate-850 pt-3">
        <span className="text-xs font-bold text-slate-450">{project.votes} Upvotes</span>
        <button
          onClick={onVote}
          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/20 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-transparent transition-all"
        >
          <ArrowUp className="w-3.5 h-3.5" /> Upvote
        </button>
      </div>
    </div>
  );
}
