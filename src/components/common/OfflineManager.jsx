import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wifi, WifiOff, RefreshCw, Trash2, CheckCircle2, 
  AlertTriangle, History, X, ChevronRight, Clock
} from "lucide-react";
import { getQueueIndexedDB, setQueue, clearQueue } from "../../utils/offlineQueue";
import { toast } from "react-toastify";

const OfflineManager = ({ isOpen, onClose }) => {
  const [pendingActions, setPendingActions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadQueue = useCallback(async () => {
    const queue = await getQueueIndexedDB();
    setPendingActions(queue.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, []);

  useEffect(() => {
    if (isOpen) loadQueue();
  }, [isOpen, loadQueue]);

  const handleRemove = async (id) => {
    const updated = pendingActions.filter(a => a.id !== id);
    await setQueue(updated);
    setPendingActions(updated);
    toast.success("Action removed from queue");
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all pending actions?")) {
      await clearQueue();
      setPendingActions([]);
      toast.success("Queue cleared");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]" 
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Offline Sync</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {pendingActions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-full">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-white">All caught up!</h3>
                  <p className="text-gray-500 text-sm max-w-[200px]">No pending actions in your offline queue.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{pendingActions.length} Pending Actions</span>
                    <button onClick={handleClearAll} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Clear All</button>
                  </div>
                  <div className="space-y-3">
                    {pendingActions.map((action) => (
                      <div key={action.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                              {action.actionType.replace("_", " ")}
                            </span>
                            <h4 className="font-semibold text-gray-900 dark:text-white mt-1">Event ID: {action.eventId}</h4>
                          </div>
                          <button onClick={() => handleRemove(action.id)} className="text-gray-400 hover:text-rose-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(action.timestamp).toLocaleTimeString()}</span>
                          <span className="flex items-center gap-1"><RefreshCw size={12} /> Retry count: {action.retryCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Actions will automatically sync when a stable connection is detected.</p>
              </div>
              <button 
                disabled={pendingActions.length === 0 || isSyncing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                Sync Now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OfflineManager;
