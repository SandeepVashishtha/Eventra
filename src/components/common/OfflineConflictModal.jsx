import React, { useState, useEffect } from "react";
import { AlertTriangle, Server, ArrowRight, Save, X, Edit3 } from "lucide-react";
import "./OfflineConflictModal.css";

export default function OfflineConflictModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [conflictData, setConflictData] = useState(null);

  useEffect(() => {
    const handleConflict = (e) => {
      if (e.detail) {
        setConflictData(e.detail);
        setIsOpen(true);
      }
    };
    window.addEventListener("eventra-offline-conflict", handleConflict);
    return () => window.removeEventListener("eventra-offline-conflict", handleConflict);
  }, []);

  if (!isOpen || !conflictData) return null;

  const { item, serverState } = conflictData;
  const localPayload = item?.payload || {};
  const serverPayload = serverState || {};

  // Find all unique keys to compare
  const allKeys = Array.from(new Set([...Object.keys(localPayload), ...Object.keys(serverPayload)]))
    .filter(key => key !== "id" && key !== "userId" && key !== "eventId" && key !== "timestamp");

  const handleResolve = (resolution) => {
    // Dispatch resolution result
    window.dispatchEvent(new CustomEvent("eventra-offline-conflict-resolved", {
      detail: {
        itemId: item.id,
        resolution, // "local", "server", or "merge"
        mergedPayload: resolution === "merge" ? { ...localPayload, ...serverPayload } : null
      }
    }));
    setIsOpen(false);
    setConflictData(null);
  };

  return (
    <div className="ocm-modal-overlay">
      <div className="ocm-modal-container">
        {/* Header */}
        <div className="ocm-header">
          <div className="flex items-center gap-3">
            <div className="ocm-warning-icon">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Offline Synchronization Conflict</h3>
              <p className="text-xs text-slate-400">
                The offline action failed because the server version changed in the meantime.
              </p>
            </div>
          </div>
          <button onClick={() => handleResolve("server")} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Comparison Area */}
        <div className="ocm-body">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="ocm-panel-title flex items-center gap-1.5 text-indigo-400">
              <Edit3 size={14} />
              <span>Your Offline Changes</span>
            </div>
            <div className="ocm-panel-title flex items-center gap-1.5 text-rose-400">
              <Server size={14} />
              <span>Current Server Version</span>
            </div>
          </div>

          <div className="ocm-diff-list">
            {allKeys.map((key) => {
              const localVal = localPayload[key] !== undefined ? String(localPayload[key]) : "--";
              const serverVal = serverPayload[key] !== undefined ? String(serverPayload[key]) : "--";
              const isDifferent = localVal !== serverVal;

              return (
                <div key={key} className={`ocm-diff-row ${isDifferent ? 'ocm-diff-changed' : ''}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1.5">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="ocm-diff-val local bg-indigo-500/5 border border-indigo-500/10 text-indigo-200">
                      {localVal}
                    </div>
                    <div className="ocm-diff-val server bg-rose-500/5 border border-rose-500/10 text-rose-200">
                      {serverVal}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer resolutions */}
        <div className="ocm-footer">
          <button 
            className="ocm-btn ocm-btn-secondary" 
            onClick={() => handleResolve("server")}
          >
            Discard Local & Keep Server
          </button>
          
          <button 
            className="ocm-btn ocm-btn-primary" 
            onClick={() => handleResolve("local")}
          >
            Overwrite Server with Local
          </button>
          
          <button 
            className="ocm-btn ocm-btn-accent" 
            onClick={() => handleResolve("merge")}
          >
            Merge Both Changes
          </button>
        </div>
      </div>
    </div>
  );
}
