import React, { useState } from "react";
import { AlertTriangle, Check, Layers } from "lucide-react";
import { getDiff } from "./diffUtils";
import "./conflict.css";

export default function ConflictResolver({
  localData = { title: "Dev Workshop Local", location: "Online Room A", capacity: 100 },
  serverData = { title: "Developer Workshop Cloud", location: "Online Main", capacity: 80 },
  onResolve
}) {
  const [resolved, setResolved] = useState({});
  const diffs = getDiff(localData, serverData);

  const selectVersion = (field, source) => {
    setResolved((prev) => ({
      ...prev,
      [field]: source === "local" ? localData[field] : serverData[field]
    }));
  };

  const handleMergeSubmit = () => {
    const merged = { ...serverData, ...localData, ...resolved };
    if (onResolve) onResolve(merged);
  };

  return (
    <div className="conflict-resolver p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl max-w-2xl mx-auto my-8">
      <div className="flex items-start gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Offline Sync Conflict Detected</h2>
          <p className="text-xs text-slate-500 mt-0.5">Please resolve differences between your local drafts and server values.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {diffs.map(({ field, localVal, serverVal }) => (
          <div key={field} className="field-conflict-card border border-slate-100 dark:border-slate-850 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{field}</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectVersion(field, "local")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  resolved[field] === localVal
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-850 hover:bg-slate-100"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Local Draft</div>
                <div className="text-sm font-semibold mt-1">{String(localVal)}</div>
              </button>

              <button
                onClick={() => selectVersion(field, "server")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  resolved[field] === serverVal
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-850 hover:bg-slate-100"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase">Cloud Server</div>
                <div className="text-sm font-semibold mt-1">{String(serverVal)}</div>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleMergeSubmit}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl transition-all shadow-md shadow-indigo-650/20"
      >
        <Check className="w-5 h-5" /> Save Resolved Changes
      </button>
    </div>
  );
}
