import React from "react";
import { Key } from "lucide-react";

export default function HistoryDecryptionProgress({ progress = 0 }) {
  return (
    <div className="space-y-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Key className="w-3.5 h-3.5 text-indigo-400" /> decrypting enclave chunks
        </span>
        <span>{progress}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
