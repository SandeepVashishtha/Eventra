import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, Eye, Search, Filter } from "lucide-react";

export default function SimilarityMatrixView({
  comparisons = [],
  onSelectDiff = () => {},
}) {
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredComparisons = comparisons.filter((item) => {
    const matchesRisk = filterRisk === "ALL" || item.riskLevel === filterRisk;
    const matchesSearch =
      item.teamNameA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teamNameB.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by team name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-200">Risk Filter:</span>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          >
            <option value="ALL">All Scores</option>
            <option value="HIGH">High Risk (&gt;70%)</option>
            <option value="MEDIUM">Medium Risk (40-70%)</option>
            <option value="LOW">Low Risk (&lt;40%)</option>
          </select>
        </div>
      </div>

      {/* Comparisons Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/60 text-xs font-semibold text-gray-500 dark:text-gray-200 uppercase tracking-wider">
                <th className="py-3 px-4">Team A</th>
                <th className="py-3 px-4">Team B</th>
                <th className="py-3 px-4">Similarity</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-xs">
              {filteredComparisons.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-200">
                    No plagiarism flags matching active filters.
                  </td>
                </tr>
              ) : (
                filteredComparisons.map((item, idx) => {
                  const isHigh = item.riskLevel === "HIGH";
                  const isMed = item.riskLevel === "MEDIUM";

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        {item.teamNameA}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-100">
                        {item.teamNameB}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isHigh ? "bg-rose-500" : isMed ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${item.similarityPercentage}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold">{item.similarityPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <ShieldAlert className="w-3.5 h-3.5" /> High Risk
                          </span>
                        ) : isMed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" /> Moderate
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle className="w-3.5 h-3.5" /> Clean
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectDiff(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Code Diff
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
