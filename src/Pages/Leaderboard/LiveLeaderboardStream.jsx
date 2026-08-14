import React from "react";
import { Award, RefreshCw, Zap } from "lucide-react";
import useSSEData from "./useSSEData";
import "./LiveLeaderboardStream.css";

export default function LiveLeaderboardStream({ eventId = "gssoc-2026" }) {
  const { data: leaderboard, isLive, error } = useSSEData(`/api/leaderboard/${eventId}/stream`);

  return (
    <div className="live-leaderboard-container p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="text-yellow-500 w-7 h-7" />
            Contributor Leaderboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Live ranking updates for active contributors</p>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Live Syncing
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
              <RefreshCw className="w-3.5 h-3.5" />
              Offline
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 p-4 rounded-xl mb-4 border border-red-200 dark:border-red-900 text-sm">
          Failed to connect to live stream. Falling back to cached standings.
        </div>
      )}

      <div className="leaderboard-table-wrapper overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-850">
              <th className="py-4 px-6 text-center w-16">Rank</th>
              <th className="py-4 px-6">Contributor</th>
              <th className="py-4 px-6 text-center">PRs Merged</th>
              <th className="py-4 px-6 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              [1, 2, 3].map((idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-850 animate-pulse">
                  <td className="py-4 px-6"><div className="h-6 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                  <td className="py-4 px-6"><div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                  <td className="py-4 px-6"><div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                  <td className="py-4 px-6"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded ml-auto" /></td>
                </tr>
              ))
            ) : (
              leaderboard.map((user, index) => (
                <tr key={user.userId || index} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-355">
                    {index + 1 <= 3 ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs text-white ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-slate-400" : "bg-amber-600"}`}>
                        {index + 1}
                      </span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">{user.name || user.username}</td>
                  <td className="py-4 px-6 text-center font-medium text-slate-600 dark:text-slate-400">{user.prCount || 0}</td>
                  <td className="py-4 px-6 text-right font-bold text-indigo-600 dark:text-indigo-400">{user.points || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
