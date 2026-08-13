import React from "react";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

export default function SpatialClearanceInspector({ warnings = [] }) {
  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-indigo-500" />
          Fire Exit & Spatial Clearance Audit
        </h4>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
          warnings.length > 0
            ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
            : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
        }`}>
          {warnings.length} Violation(s)
        </span>
      </div>

      {warnings.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle className="w-4 h-4" />
          All tables meet minimum 1.5m emergency exit clearance guidelines.
        </div>
      ) : (
        <div className="space-y-2 max-h-36 overflow-y-auto">
          {warnings.map((w, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                {w.tableName} blocks {w.exitName}
              </span>
              <span className="font-mono text-[11px] font-bold">
                {w.distanceMeters}m aisle
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
