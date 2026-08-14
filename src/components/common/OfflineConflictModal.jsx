import React, { useState } from "react";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import "./conflict-modal.css";

export default function OfflineConflictModal({
  isOpen = true,
  localData = { title: "Draft Workshop Info", description: "Learn React offline" },
  serverData = { title: "Workshop Cloud Info", description: "Learn React and Tailwind" },
  onResolve,
  onClose
}) {
  const [resolved, setResolved] = useState({});

  if (!isOpen) return null;

  const handleSelect = (field, value) => {
    setResolved(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    const finalData = {
      title: resolved.title !== undefined ? resolved.title : serverData.title,
      description: resolved.description !== undefined ? resolved.description : serverData.description
    };
    if (onResolve) onResolve(finalData);
  };

  return (
    <div className="conflict-modal-overlay">
      <div className="conflict-modal-card">
        <div className="flex items-center gap-2 mb-4 text-amber-500">
          <AlertTriangle className="w-6 h-6 animate-bounce" />
          <h3 className="text-lg font-bold">Data Sync Conflict</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Changes made offline conflict with the latest server data. Select the values to keep:
        </p>
        
        <div className="flex flex-col gap-4 mb-6">
          {["title", "description"].map((field) => (
            <div key={field} className="border border-slate-200 dark:border-slate-800 p-3 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{field}</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleSelect(field, localData[field])}
                  className={`p-2 rounded text-xs text-left border ${
                    resolved[field] === localData[field] ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span className="block font-bold opacity-60">Local</span>
                  {localData[field]}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelect(field, serverData[field])}
                  className={`p-2 rounded text-xs text-left border ${
                    resolved[field] === serverData[field] ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-650" : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <span className="block font-bold opacity-60">Server</span>
                  {serverData[field]}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-650">
            Cancel
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold flex items-center gap-1">
            <Check className="w-4 h-4" /> Resolve Conflicts
          </button>
        </div>
      </div>
    </div>
  );
}
