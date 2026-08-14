import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function CheckInStatusCard({ result }) {
  if (result.success) {
    return (
      <div className="status-card bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 p-4 rounded-2xl flex items-start gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-450 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-emerald-850 dark:text-emerald-400">Check-in Approved</h4>
          <p className="text-xs text-emerald-700 mt-1">
            <strong>Attendee:</strong> {result.attendee} <br />
            <strong>Session:</strong> {result.event} <br />
            <strong>Checked-in:</strong> {result.checkedInAt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-card bg-red-50 dark:bg-red-950/20 border border-red-255 dark:border-red-900/50 p-4 rounded-2xl flex items-start gap-3">
      {result.reason === "DUPLICATE" ? (
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
      ) : (
        <XCircle className="w-6 h-6 text-red-650 shrink-0" />
      )}
      <div>
        <h4 className="text-sm font-bold text-red-800 dark:text-red-400">
          {result.reason === "DUPLICATE" ? "Warning: Already Checked In" : "Access Denied"}
        </h4>
        <p className="text-xs text-red-750 mt-1">{result.message}</p>
      </div>
    </div>
  );
}
