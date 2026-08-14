import React from "react";
import { Cpu } from "lucide-react";

export default function GeneratorStatusIndicator({ progress = 0 }) {
  return (
    <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1">
          <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> compiling WASM streams
        </span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
