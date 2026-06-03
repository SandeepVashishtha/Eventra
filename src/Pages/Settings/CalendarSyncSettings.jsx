import React from "react";
import { useCalendarSync } from "../../hooks/useCalendarSync";
import { Calendar, RefreshCw, CheckCircle2, AlertCircle, Settings, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const CalendarSyncSettings = () => {
  const { isSyncing, connectedAccounts, toggleSync, manualSyncAll } = useCalendarSync();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar className="text-indigo-500" /> Calendar Integration
          </h1>
          <p className="text-gray-500 mt-1">Sync your Eventra registrations with your personal primary calendars.</p>
        </div>
        <button 
          onClick={manualSyncAll}
          disabled={isSyncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          Sync All Now
        </button>
      </div>

      <div className="space-y-6">
        {connectedAccounts.map((acc) => (
          <motion.div 
            key={acc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-indigo-500/30 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${acc.connected ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
                <Settings size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">{acc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {acc.connected ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">Connected</span>
                      <span className="text-sm text-gray-400 ml-2">Last synced: {acc.lastSynced}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="text-amber-500" />
                      <span className="text-sm text-gray-500">Not connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {acc.connected ? (
                <button 
                  onClick={() => toggleSync(acc.id)}
                  className="px-5 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
                >
                  Disconnect
                </button>
              ) : (
                <button 
                  onClick={() => toggleSync(acc.id)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                >
                  Connect <ExternalLink size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Pro Tip: iCal Subscriptions</h4>
        <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
          Don't want to use OAuth? You can also subscribe to your personalized Eventra iCal feed. This provides a one-way sync to any calendar app that supports URL-based subscriptions.
        </p>
        <button className="mt-4 text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline">Copy iCal URL</button>
      </div>
    </div>
  );
};

export default CalendarSyncSettings;
