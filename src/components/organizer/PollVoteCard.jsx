import React from "react";

export default function PollVoteCard({ poll, onVote }) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="poll-vote-card p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 leading-relaxed">
        {poll.question}
      </h4>

      <div className="flex flex-col gap-3">
        {poll.options.map((opt) => {
          const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <div key={opt.id} className="relative">
              <button
                onClick={() => onVote(opt.id)}
                className="w-full text-left p-3 border border-slate-200 dark:border-slate-800 rounded-xl relative overflow-hidden transition-all bg-white dark:bg-slate-900 hover:border-indigo-500"
              >
                <div
                  style={{ width: `${percent}%` }}
                  className="absolute left-0 top-0 bottom-0 bg-indigo-50/50 dark:bg-indigo-950/20 transition-all duration-500 pointer-events-none"
                />
                <div className="relative z-10 flex justify-between text-xs font-semibold text-slate-800 dark:text-slate-205">
                  <span>{opt.text}</span>
                  <span>{percent}% ({opt.votes})</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
