import React from "react";
import { Link2 } from "lucide-react";

export default function SwarmConnectivityOverlay() {
  return (
    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-gray-900/50 border border-gray-150 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-500">
      <div className="flex items-center gap-1.5">
        <Link2 className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
        <span>P2P Swarm Connection Network status</span>
      </div>
      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
        Connected
      </span>
    </div>
  );
}
