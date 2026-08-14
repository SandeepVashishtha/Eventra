import React from "react";

export default function QuestionCard({ question, onSelect }) {
  return (
    <div className="question-card p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
      <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-4 leading-relaxed">
        {question.question}
      </h4>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className="w-full text-left p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all font-semibold text-xs text-slate-800 dark:text-slate-200"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
