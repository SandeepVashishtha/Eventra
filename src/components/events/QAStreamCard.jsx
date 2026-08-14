import React from "react";
import { ArrowUpCircle } from "lucide-react";

export default function QAStreamCard({ question, onUpvote }) {
  return (
    <div className="qa-card flex items-start justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl hover:shadow-sm transition-shadow">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {question.isAnonymous ? "Anonymous User" : question.user}
          </span>
        </div>
        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
          {question.text}
        </p>
      </div>

      <button
        onClick={onUpvote}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ArrowUpCircle className="w-5 h-5" />
        <span className="text-xs font-bold">{question.upvotes}</span>
      </button>
    </div>
  );
}
