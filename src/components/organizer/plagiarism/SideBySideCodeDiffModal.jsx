import React from "react";
import { X, Code2, AlertTriangle, FileCode2 } from "lucide-react";

export default function SideBySideCodeDiffModal({
  comparison = null,
  onClose = () => {},
}) {
  if (!comparison) return null;

  const codeA = `// ${comparison.teamNameA} Submission Code
function processHackathonSubmission(teamData) {
  const score = teamData.innovation * 0.4 + teamData.quality * 0.6;
  if (score > 80) {
    return { status: "QUALIFIED", score };
  }
  return { status: "REVIEW_NEEDED", score };
}`;

  const codeB = `// ${comparison.teamNameB} Submission Code
function evaluateSubmission(submission) {
  const result = submission.innovation * 0.4 + submission.quality * 0.6;
  if (result > 80) {
    return { status: "QUALIFIED", result };
  }
  return { status: "REVIEW_NEEDED", result };
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-5xl rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
          <div className="flex items-center gap-3">
            <FileCode2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                AST Structural Code Diff Inspector
                <span className="px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-mono">
                  {comparison.similarityPercentage}% Match
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-200">
                Comparing {comparison.teamNameA} vs {comparison.teamNameB}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Code Windows */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-800 h-[420px] bg-slate-950 font-mono text-xs text-slate-100">
          {/* Code Window A */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-indigo-400 font-semibold flex items-center justify-between">
              <span>{comparison.teamNameA}</span>
              <span className="text-[10px] text-slate-400">Source: main.js</span>
            </div>
            <pre className="flex-1 p-4 overflow-auto leading-6 whitespace-pre-wrap selection:bg-rose-900/60">
              {codeA}
            </pre>
          </div>

          {/* Code Window B */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-rose-400 font-semibold flex items-center justify-between">
              <span>{comparison.teamNameB}</span>
              <span className="text-[10px] text-slate-400">Source: app.js</span>
            </div>
            <pre className="flex-1 p-4 overflow-auto leading-6 whitespace-pre-wrap selection:bg-rose-900/60">
              {codeB}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <AlertTriangle className="w-4 h-4" />
            High AST token structural match detected despite variable rename.
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close Diff Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
