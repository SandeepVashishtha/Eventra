import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export default function ZkpVerificationBadge({ proofVerified = true, nullifierHash = null }) {
  if (!proofVerified) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
      <ShieldCheck className="w-4 h-4 text-emerald-500" />
      <span>Verified Attendee (ZKP Anonymous)</span>
      {nullifierHash && (
        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
          {nullifierHash.substring(0, 8)}...
        </span>
      )}
    </div>
  );
}
