import React from "react";
import { AlertTriangle, Code, ShieldAlert } from "lucide-react";

export default function PlagiarismDashboard({ submissions = [] }) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-xs text-gray-900 dark:text-white">
      <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">AST Plagiarism Detection Portal</span>
        </div>
        <span className="font-mono text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
          Auto-Flagging Active
        </span>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-gray-950">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 font-bold">
              <th className="p-3">Team A</th>
              <th className="p-3">Team B</th>
              <th className="p-3">AST Similarity</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub, idx) => (
              <tr key={idx} className="border-b border-gray-150 dark:border-gray-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                <td className="p-3 font-semibold">{sub.teamA}</td>
                <td className="p-3 font-semibold">{sub.teamB}</td>
                <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{sub.similarity.toFixed(1)}%</td>
                <td className="p-3">
                  {sub.similarity > 80 ? (
                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Risk
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-bold">Pass</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
