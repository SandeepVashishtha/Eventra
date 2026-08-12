import React, { useState } from "react";
import { Trophy, Eye, EyeOff, Download, Sliders, CheckCircle } from "lucide-react";
import RubricBuilder from "./RubricBuilder";
import JudgeScorecardModal from "./JudgeScorecardModal";

const INITIAL_SUBMISSIONS = [
  { id: "sub-1", projectTitle: "WebAssembly Zero-Server Compressor", teamName: "Wasm Pioneers", judgesCount: 4, trimmedMeanScore: 92.5, rank: 1 },
  { id: "sub-2", projectTitle: "ZKP Whistleblower Feedback Portal", teamName: "CryptoGuard", judgesCount: 4, trimmedMeanScore: 88.0, rank: 2 },
  { id: "sub-3", projectTitle: "Real-Time Pair-Programming Canvas", teamName: "PeerCode Squad", judgesCount: 4, trimmedMeanScore: 84.2, rank: 3 },
];

export default function ScoreAggregationMatrix() {
  const [isBlind, setIsBlind] = useState(true);
  const [submissions, setSubmissions] = useState(INITIAL_SUBMISSIONS);
  const [activeModalSub, setActiveModalSub] = useState(null);
  const [showRubricBuilder, setShowRubricBuilder] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBlind(!isBlind)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              isBlind
                ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200 dark:border-indigo-800"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600"
            }`}
          >
            {isBlind ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isBlind ? "Blind Review Enabled" : "Revealed Identities"}
          </button>

          <button
            onClick={() => setShowRubricBuilder(!showRubricBuilder)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold"
          >
            <Sliders className="w-4 h-4" /> Custom Rubric
          </button>
        </div>

        <span className="font-mono text-gray-400">Trimmed Mean Normalization Active</span>
      </div>

      {showRubricBuilder && <RubricBuilder />}

      {/* Leaderboard Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Hackathon Score Aggregation Matrix
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 font-semibold">
                <th className="py-2 px-3">Rank</th>
                <th className="py-2 px-3">Project Submission</th>
                <th className="py-2 px-3">Team</th>
                <th className="py-2 px-3 font-mono">Judges</th>
                <th className="py-2 px-3 font-mono text-right">Trimmed Mean</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="py-3 px-3 font-bold text-amber-500">#{sub.rank}</td>
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{sub.projectTitle}</td>
                  <td className="py-3 px-3 text-gray-500">{isBlind ? "••••••••" : sub.teamName}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{sub.judgesCount} Judges</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-right">
                    {sub.trimmedMeanScore} / 100
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setActiveModalSub(sub)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold"
                    >
                      Evaluate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModalSub && (
        <JudgeScorecardModal
          submission={activeModalSub}
          isBlindReview={isBlind}
          isOpen={Boolean(activeModalSub)}
          onClose={() => setActiveModalSub(null)}
        />
      )}
    </div>
  );
}
