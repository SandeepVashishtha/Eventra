import React from "react";
import { RefreshCw } from "lucide-react";

export default function SyncStatusWidget() {
  return (
    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex justify-between items-center text-[10px] text-slate-400">
      <div className="flex items-center gap-1.5">
        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        <span>Live Webcal Sync Stream Status</span>
      </div>
      <span className="font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-900/55">
        Active
      </span>
    </div>
  );
}
