import React from "react";
import { RefreshCw, Check } from "lucide-react";

export default function SyncStatusIndicator({ status = "synced" }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500">
      {status === "saving" ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
          <span>Syncing CRDT changes...</span>
        </>
      ) : (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Offline state synced</span>
        </>
      )}
    </div>
  );
}
