import React, { useState } from "react";
import { ShieldCheck, BarChart2, Eye, RefreshCw } from "lucide-react";
import PrivacyBudgetSlider from "./PrivacyBudgetSlider";
import { addDifferentialPrivacyNoise } from "../../../utils/privacy/differentialPrivacy";

const RAW_FEEDBACK_DATA = [
  { rating: "5 Stars (Excellent)", count: 120 },
  { rating: "4 Stars (Good)", count: 85 },
  { rating: "3 Stars (Average)", count: 25 },
  { rating: "2 Stars (Below Avg)", count: 8 },
  { rating: "1 Star (Poor)", count: 2 },
];

export default function DifferentialPrivacyChart() {
  const [epsilon, setEpsilon] = useState(0.5);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Privacy Budget Controls */}
      <PrivacyBudgetSlider epsilon={epsilon} onChangeEpsilon={setEpsilon} />

      {/* Differentially Private Chart Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Anonymized Hackathon Survey Feedback
            </h3>
          </div>

          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Laplace Mechanism Active (ε = {epsilon})
          </span>
        </div>

        <div className="space-y-3">
          {RAW_FEEDBACK_DATA.map((item, idx) => {
            const noisyCount = addDifferentialPrivacyNoise(item.count, epsilon);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">{item.rating}</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ~{noisyCount} Attendees (Noise Injected)
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (noisyCount / 140) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
