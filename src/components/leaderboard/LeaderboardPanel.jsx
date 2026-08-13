import React, { useState, useTransition } from "react";
import { Trophy, ArrowUp } from "lucide-react";
import useLeaderboardUpdate from "../../hooks/useLeaderboardUpdate";

export default function LeaderboardPanel({ initialUsers = [
  { name: "Suman", score: 120 }, { name: "Raj", score: 95 }, { name: "Amit", score: 110 }
] }) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();

  // Custom throttled updates to bypass fiber render starvation (#16540)
  const handleScoreUpdate = (name, value) => {
    startTransition(() => {
      setUsers((prev) => {
        const next = prev.map((u) => (u.name === name ? { ...u, score: u.score + value } : u));
        return [...next].sort((a, b) => b.score - a.score);
      });
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-800 pb-3">
        <span className="font-bold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Leaderboard rankings
        </span>
        {isPending && <span className="text-[10px] text-gray-400 italic">Re-sorting grid...</span>}
      </div>

      <div className="space-y-2">
        {users.map((usr, idx) => (
          <div key={idx} className="p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-950/40 flex justify-between items-center">
            <span className="font-semibold">{usr.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{usr.score} pts</span>
              <button
                onClick={() => handleScoreUpdate(usr.name, 10)}
                className="p-1 rounded bg-indigo-55 hover:scale-105 transition-transform"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
