import React, { useState } from "react";
import { BarChart3, CheckCircle } from "lucide-react";

export default function LiveAudiencePoll({
  pollQuestion = "Which frontend framework do you plan to use for your hackathon project?",
  options = [
    { id: 1, label: "React 19 / Vite", votes: 42 },
    { id: 2, label: "Next.js (App Router)", votes: 38 },
    { id: 3, label: "Vue 3 / Nuxt", votes: 12 },
    { id: 4, label: "SvelteKit", votes: 8 },
  ],
}) {
  const [pollOptions, setPollOptions] = useState(options);
  const [userVotedId, setUserVotedId] = useState(null);

  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = (id) => {
    if (userVotedId !== null) return;
    setUserVotedId(id);
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          <BarChart3 className="w-4 h-4" /> Live Audience Poll
        </div>
        <span className="text-[11px] text-gray-500 font-mono">{totalVotes} Total Votes</span>
      </div>

      <h3 className="text-xs font-bold text-gray-900 dark:text-white leading-relaxed">
        {pollQuestion}
      </h3>

      <div className="space-y-2">
        {pollOptions.map((opt) => {
          const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          const isUserChoice = userVotedId === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={userVotedId !== null}
              className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition-all text-xs ${
                isUserChoice
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300"
              }`}
            >
              {/* Progress Background Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-indigo-600/10 dark:bg-indigo-600/20 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />

              <div className="relative z-10 flex items-center justify-between">
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                  {opt.label}
                  {isUserChoice && <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />}
                </span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {percent}% ({opt.votes})
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
