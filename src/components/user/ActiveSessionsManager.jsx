import React, { useState } from "react";
import { Monitor, Smartphone, Globe, ShieldAlert, LogOut } from "lucide-react";
import "./active-sessions.css";

export default function ActiveSessionsManager() {
  const [sessions, setSessions] = useState([
    { id: 1, device: "macOS - Chrome Browser", ip: "192.168.1.42", activeTime: "Active Now", isCurrent: true },
    { id: 2, device: "iPhone 15 - Safari Mobile", ip: "10.0.0.15", activeTime: "Last active: 2 hours ago", isCurrent: false },
    { id: 3, device: "Windows 11 - Firefox", ip: "172.16.25.4", activeTime: "Last active: 1 day ago", isCurrent: false }
  ]);

  const terminateSession = (id) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    alert("Session successfully revoked and logged out.");
  };

  const terminateAllOther = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    alert("All other device sessions successfully revoked.");
  };

  return (
    <div className="active-sessions-manager p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg max-w-xl mx-auto my-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Globe className="text-indigo-650 dark:text-indigo-400 w-5 h-5" />
            Active Session Security
          </h2>
          <p className="text-xs text-slate-500 mt-1">Review and manage devices currently logged into your account</p>
        </div>

        <button
          onClick={terminateAllOther}
          className="text-xs font-semibold text-red-650 hover:underline flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Log out other devices
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
            <div className="flex items-center gap-3">
              {session.device.toLowerCase().includes("iphone") ? (
                <Smartphone className="w-5 h-5 text-slate-400" />
              ) : (
                <Monitor className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  {session.device}
                  {session.isCurrent && (
                    <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-650 px-2 py-0.5 rounded-full border border-emerald-200">
                      Current
                    </span>
                  )}
                </h4>
                <span className="text-[10px] text-slate-400 block mt-1">IP: {session.ip} • {session.activeTime}</span>
              </div>
            </div>

            {!session.isCurrent && (
              <button
                onClick={() => terminateSession(session.id)}
                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-transparent hover:border-red-200 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
