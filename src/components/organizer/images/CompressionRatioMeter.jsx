import React from "react";
import { Sparkles } from "lucide-react";

export default function CompressionRatioMeter({ ratio = 100 }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex flex-col justify-center text-center">
      <div className="mx-auto p-2 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <Sparkles className="w-5 h-5" />
      </div>
      <h4 className="font-bold text-gray-500">WASM Compression Ratio</h4>
      <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
        {ratio}%
      </div>
      <p className="text-[10px] text-gray-400">
        Output compiled successfully using offscreen assembly compression arrays.
      </p>
    </div>
  );
}
