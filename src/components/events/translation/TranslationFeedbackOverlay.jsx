import React from "react";
import { Loader2 } from "lucide-react";

export default function TranslationFeedbackOverlay() {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/50 flex items-center gap-2 justify-center font-semibold text-gray-500 animate-pulse text-xs">
      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
      Running local AI translation pipeline...
    </div>
  );
}
