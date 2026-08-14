import React, { useState } from "react";
import { Shield, Eye, Check, Trash } from "lucide-react";
import "./moderation-dashboard.css";

export default function ModerationFlagDashboard() {
  const [flags, setFlags] = useState([
    { id: 1, type: "Comment", user: "Raj Patel", content: "Spam comment promotion link click here", category: "Spam", score: 85 },
    { id: 2, type: "Project", user: "Hacker X", content: "Offensive terminology in project description", category: "Harassment", score: 92 }
  ]);

  const handleApprove = (id) => {
    setFlags(prev => prev.filter(f => f.id !== id));
    alert("Flagged item approved as clean.");
  };

  const handleDelete = (id) => {
    setFlags(prev => prev.filter(f => f.id !== id));
    alert("Flagged item successfully deleted from platform.");
  };

  return (
    <div className="moderation-dashboard-wrapper p-6 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl shadow-lg max-w-3xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Shield className="text-red-500 w-5 h-5" />
            Moderation Flag Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review flagged submissions, comments, and project updates</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {flags.length === 0 ? (
          <div className="text-center py-12 text-slate-450 font-medium">All flags resolved! Codebase is clean.</div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-650">
                    {flag.category}
                  </span>
                  <span className="text-[10px] text-slate-400">Flagged by: {flag.user}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">{flag.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => handleApprove(flag.id)}
                  className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Keep
                </button>
                <button
                  onClick={() => handleDelete(flag.id)}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  <Trash className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
