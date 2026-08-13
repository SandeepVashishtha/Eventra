import React from "react";
import { Terminal } from "lucide-react";

export default function ExecutionTerminal({ output = "", status = "idle" }) {
  const statusColors = {
    idle: "text-slate-400",
    running: "text-amber-500",
    success: "text-emerald-500 font-bold",
    error: "text-rose-500 font-bold",
  };

  return (
    <div className="p-4 rounded-3xl border border-gray-200 dark:border-gray-800 bg-slate-900 text-[10px] font-mono text-slate-300 space-y-2">
      <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
        <span className="font-bold">Console Output Logs</span>
        <span className={`ml-auto font-sans font-semibold px-2 py-0.5 rounded-full bg-white/5 ${statusColors[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      <pre className="whitespace-pre-wrap overflow-x-auto leading-relaxed">{output}</pre>
    </div>
  );
}
