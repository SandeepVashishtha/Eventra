import React from "react";
import { X, Check } from "lucide-react";

export default function MeshDetailsCard({ booth = {}, onClose = () => {} }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex justify-between items-center text-xs">
      <div className="space-y-1">
        <h4 className="font-bold text-gray-800 dark:text-white">{booth.sponsor} Booth Details</h4>
        <p className="text-[10px] text-gray-500">Tier classification levels: {booth.level}</p>
      </div>
      <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
