import React from "react";
import { History, Shield, Globe, Clock, Monitor } from "lucide-react";

const AuditLogs = () => {
  const logs = [
    { id: 1, event: "Login Success", user: "admin@eventra.com", ip: "192.168.1.1", device: "Chrome on macOS", timestamp: "2024-06-02 10:15 AM" },
    { id: 2, event: "MFA Enabled", user: "user@example.com", ip: "104.28.45.12", device: "Safari on iOS", timestamp: "2024-06-02 09:42 AM" },
    { id: 3, event: "Password Changed", user: "organizer@tech.io", ip: "45.12.98.2", device: "Firefox on Windows", timestamp: "2024-06-01 11:20 PM" },
    { id: 4, event: "Admin Access", user: "super@admin.net", ip: "192.168.1.5", device: "Chrome on Linux", timestamp: "2024-06-01 04:05 PM" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
          <Shield size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Security Audit Logs</h1>
          <p className="text-gray-500">Track account activity and security events across the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Event</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Device</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                      log.event.includes("Success") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                      log.event.includes("MFA") ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" :
                      "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    }`}>
                      {log.event}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium dark:text-white">{log.user}</td>
                  <td className="px-6 py-5 text-sm text-gray-500 font-mono flex items-center gap-1.5">
                    <Globe size={12} /> {log.ip}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500 flex items-center gap-1.5">
                    <Monitor size={12} /> {log.device}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
