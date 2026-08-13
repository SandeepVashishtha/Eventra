import React from "react";
import { X, CheckSquare } from "lucide-react";

export default function BoothPropertiesModal({ booth = {}, onClose = () => {} }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 space-y-3 flex items-center justify-between text-xs text-gray-900 dark:text-white">
      <div className="flex items-center gap-1.5 font-bold text-gray-500">
        <CheckSquare className="w-4 h-4" /> Selected Sponsor: {booth.sponsor}
      </div>
      <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
