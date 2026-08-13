import React, { useState } from "react";
import { ShieldCheck, EyeOff, BarChart3 } from "lucide-react";
import { anonymizeDataset } from "../../../utils/privacy/kanonymity";
import SafetyScoreWidget from "./SafetyScoreWidget";

export default function KAnonymityChart({ rawData = [
  { age: 25, gender: "M" }, { age: 28, gender: "M" }, { age: 24, gender: "M" },
  { age: 35, gender: "F" }, { age: 19, gender: "F" }
] }) {
  const [kVal, setKVal] = useState(3);
  const { anonymized, suppressedCount } = anonymizeDataset(rawData, kVal);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-bold">K-Anonymity Demographic Chart</span>
        </div>

        <div className="flex items-center gap-2 font-semibold">
          <span>Privacy Threshold (k):</span>
          <input
            type="number"
            min="2"
            max="10"
            value={kVal}
            onChange={(e) => setKVal(Number(e.target.value))}
            className="w-12 p-1 border border-gray-200 dark:border-gray-800 rounded bg-transparent text-center outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 bg-slate-50/50 dark:bg-gray-950/30">
          <div className="flex items-center gap-1 font-bold text-gray-500">
            <BarChart3 className="w-4 h-4" /> Bins Meeting k-Threshold
          </div>
          <div className="space-y-2">
            {anonymized.map((bin, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800">
                <span className="font-mono font-semibold text-[10px] text-gray-500">{bin.bucket.toUpperCase()}</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{bin.count} rows</span>
              </div>
            ))}
          </div>
        </div>

        <SafetyScoreWidget suppressedCount={suppressedCount} totalCount={rawData.length} kVal={kVal} />
      </div>
    </div>
  );
}
