import React, { useState, useEffect } from "react";
import { Terminal, Shield, RefreshCw } from "lucide-react";
import LogConsole from "./LogConsole";
import "./admin-monitor.css";

export default function LiveLogMonitor() {
  const [logs, setLogs] = useState([
    { id: 1, type: "INFO", text: "Spring Boot server initialized successfully.", time: "10:30:12" },
    { id: 2, type: "WARN", text: "Slow query detected in EventRepository (120ms).", time: "10:30:45" },
    { id: 3, type: "ERROR", text: "JWT verification failed: signature is invalid.", time: "10:31:02" }
  ]);
  const [filter, setFilter] = useState("ALL");
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!isSyncing) return;

    // Simulate logs stream
    const interval = setInterval(() => {
      const types = ["INFO", "WARN", "ERROR"];
      const messages = {
        INFO: "User user-452 checked in for AI Workshop.",
        WARN: "High connection load on Redis server (80%).",
        ERROR: "Database connection dropped. Attempting failover reconnect..."
      };
      const type = types[Math.floor(Math.random() * 3)];
      const text = messages[type];
      const now = new Date();
      const time = now.toTimeString().split(" ")[0];

      setLogs((prev) => [...prev.slice(-49), { id: Date.now(), type, text, time }]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSyncing]);

  return (
    <div className="live-log-monitor p-6 bg-slate-950 border border-slate-850 rounded-3xl shadow-xl max-w-4xl mx-auto my-8 text-white">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Terminal className="text-emerald-400 w-6 h-6 animate-pulse" />
            System Live Log stream
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time HTTP requests, websocket handshakes, and errors</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none"
          >
            <option value="ALL">All Logs</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warnings</option>
            <option value="ERROR">Errors</option>
          </select>

          <button
            onClick={() => setIsSyncing(!isSyncing)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              isSyncing
                ? "bg-emerald-950/20 text-emerald-400 border-emerald-800"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing" : "Paused"}
          </button>
        </div>
      </div>

      <LogConsole logs={logs} filter={filter} />
    </div>
  );
}
