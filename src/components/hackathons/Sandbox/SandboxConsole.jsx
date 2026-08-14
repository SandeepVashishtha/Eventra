import React from "react";
import { Trash2 } from "lucide-react";

export default function SandboxConsole({ logs, onClear }) {
  return (
    <div className="sandbox-console bg-slate-950 border border-slate-850 rounded-2xl p-4 flex-1 flex flex-col min-h-[120px]">
      <div className="flex justify-between items-center mb-3 border-b border-slate-900 pb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Console Outputs</span>
        <button onClick={onClear} className="text-slate-500 hover:text-white transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="console-lines flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-355 flex flex-col gap-1">
        {logs.length === 0 ? (
          <span className="text-slate-600">Console empty...</span>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="console-line truncate">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
