import React from "react";
import { ShieldCheck, Sliders } from "lucide-react";
import { getPrivacyGuaranteeLabel } from "../../../utils/privacy/differentialPrivacy";

export default function PrivacyBudgetSlider({
  epsilon = 0.5,
  onChangeEpsilon = () => {},
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Differential Privacy Budget (ε = {epsilon})</span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
          {getPrivacyGuaranteeLabel(epsilon)}
        </span>
      </div>

      <input
        type="range"
        min="0.1"
        max="2.0"
        step="0.1"
        value={epsilon}
        onChange={(e) => onChangeEpsilon(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />

      <div className="flex justify-between text-[10px] text-gray-400 font-mono">
        <span>Strict Privacy (ε = 0.1)</span>
        <span>High Accuracy (ε = 2.0)</span>
      </div>
    </div>
  );
}
