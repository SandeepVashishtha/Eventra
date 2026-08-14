import React, { useState } from "react";
import { Download, FileText, Settings, RefreshCw } from "lucide-react";
import "./gdpr-request.css";

export default function GDPRDataRequest() {
  const [requestStatus, setRequestStatus] = useState("idle"); // idle, preparing, ready

  const requestDataExport = () => {
    setRequestStatus("preparing");
    setTimeout(() => {
      setRequestStatus("ready");
    }, 2500);
  };

  return (
    <div className="gdpr-request-panel p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto my-8">
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
        <FileText className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
        <h3 className="font-bold text-slate-900 dark:text-white">GDPR Personal Data Archive</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6 leading-relaxed">
        Under GDPR rules, you are authorized to request a full structured file archive containing all registrations, submissions, profile logs, and preferences linked to your account.
      </p>

      {requestStatus === "idle" && (
        <button
          onClick={requestDataExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-650/15"
        >
          Request Account Archive
        </button>
      )}

      {requestStatus === "preparing" && (
        <div className="text-xs text-indigo-600 font-semibold py-2.5 flex items-center gap-1.5 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" /> Gathering and packaging user database profiles...
        </div>
      )}

      {requestStatus === "ready" && (
        <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
          <div>
            <h4 className="text-xs font-bold">Archive Pack Ready</h4>
            <span className="text-[10px] text-slate-400 block mt-1">Package size: 1.4 MB • Format: ZIP</span>
          </div>
          <button
            onClick={() => alert("Personal account logs ZIP downloaded.")}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" /> Download ZIP
          </button>
        </div>
      )}
    </div>
  );
}
