import React from "react";
import { Lock, ShieldCheck, DollarSign, Award } from "lucide-react";

export default function HomomorphicBenchmarkWidget({
  title = "Average Hackathon Prize Pool Benchmark",
  averageAmount = "$12,500",
  sampleCount = 42,
}) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
          <Lock className="w-4 h-4" /> Paillier Homomorphic Encrypted Benchmark
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Zero Server Exposure
        </span>
      </div>

      <div>
        <h4 className="text-xs text-gray-500">{title}</h4>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
          {averageAmount}
        </h2>
      </div>

      <p className="text-[11px] text-gray-400 font-mono">
        Aggregated over {sampleCount} event financial records using additive homomorphic ciphertexts.
      </p>
    </div>
  );
}
