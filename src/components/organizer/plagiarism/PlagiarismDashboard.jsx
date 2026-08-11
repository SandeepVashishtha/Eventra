import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, FileSpreadsheet, Play, Layers, CheckCircle2 } from "lucide-react";
import SimilarityMatrixView from "./SimilarityMatrixView";
import SideBySideCodeDiffModal from "./SideBySideCodeDiffModal";

const MOCK_COMPARISONS = [
  {
    submissionIdA: "sub-01",
    teamNameA: "Team Alpha Code",
    submissionIdB: "sub-04",
    teamNameB: "Team Delta Hackers",
    similarityPercentage: 88.5,
    riskLevel: "HIGH",
  },
  {
    submissionIdA: "sub-02",
    teamNameA: "Byte Builders",
    submissionIdB: "sub-05",
    teamNameB: "Cyber Squad",
    similarityPercentage: 54.2,
    riskLevel: "MEDIUM",
  },
  {
    submissionIdA: "sub-03",
    teamNameA: "Quantum Devs",
    submissionIdB: "sub-06",
    teamNameB: "Code Ninjas",
    similarityPercentage: 12.0,
    riskLevel: "LOW",
  },
];

export default function PlagiarismDashboard({ hackathonTitle = "Global Open Source Hackathon 2026" }) {
  const [comparisons, setComparisons] = useState(MOCK_COMPARISONS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDiff, setSelectedDiff] = useState(null);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleExportCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Team A,Team B,Similarity Score (%),Risk Level\n" +
      comparisons
        .map((c) => `"${c.teamNameA}","${c.teamNameB}",${c.similarityPercentage},${c.riskLevel}`)
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plagiarism_audit_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const highRiskCount = comparisons.filter((c) => c.riskLevel === "HIGH").length;
  const mediumRiskCount = comparisons.filter((c) => c.riskLevel === "MEDIUM").length;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Code Originality & Plagiarism Detector
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AST AST Fingerprint Scan • {hackathonTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV Audit Report
          </button>

          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            {isAnalyzing ? "Scanning AST Fingerprints..." : "Run AST Scan"}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pairwise Scanned</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{comparisons.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">High Risk Flags (&gt;70%)</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{highRiskCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Clean Submissions</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {comparisons.length - highRiskCount - mediumRiskCount}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Similarity Matrix Section */}
      <SimilarityMatrixView
        comparisons={comparisons}
        onSelectDiff={(item) => setSelectedDiff(item)}
      />

      {/* Side by Side Diff Inspector Modal */}
      {selectedDiff && (
        <SideBySideCodeDiffModal
          comparison={selectedDiff}
          onClose={() => setSelectedDiff(null)}
        />
      )}
    </div>
  );
}
