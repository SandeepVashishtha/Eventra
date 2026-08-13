import { ShieldCheck, Lock } from "lucide-react";

export default function ProofBadge({
  commitment = "0x8a9b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t",
  label = "Age Requirement Proven (18+)",
}) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center justify-between gap-4 text-xs select-none">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{label}</span>
        </div>
        <p className="text-[10px] text-gray-400 font-mono line-clamp-1">
          ZKP Commit: {commitment}
        </p>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold font-mono">
        <Lock className="w-3.5 h-3.5" /> ZK-Proven
      </div>
    </div>
  );
}
