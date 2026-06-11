import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, Trash2, CheckCircle2, 
  AlertTriangle, History, X, Clock
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

  const handleSyncNow = () => {
    setIsSyncing(true);
    window.dispatchEvent(new CustomEvent("eventra-background-sync"));
  };

  useEffect(() => {
    const handleQueueProcessed = () => {
      setIsSyncing(false);
      loadQueue();
    };

    const handleQueueUpdated = () => {
      loadQueue();
    };

    window.addEventListener("eventra-offline-queue-processed", handleQueueProcessed);
    window.addEventListener("eventra-offline-queue-updated", handleQueueUpdated);

    return () => {
      window.removeEventListener("eventra-offline-queue-processed", handleQueueProcessed);
      window.removeEventListener("eventra-offline-queue-updated", handleQueueUpdated);
    };
  }, [loadQueue]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[100] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 p-6 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30">
                  <History size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Offline Sync</h2>
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {pendingActions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-gray-50 p-4 dark:bg-gray-700/30">
                    <CheckCircle2 size={48} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold dark:text-white">All caught up!</h3>
                  <p className="max-w-[200px] text-sm text-gray-500">No pending actions in your offline queue.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">{pendingActions.length} Pending Actions</span>
                    <button onClick={handleClearAll} className="text-xs font-semibold text-rose-600 hover:text-rose-700">Clear All</button>
                  </div>
                  <div className="space-y-3">
                    {pendingActions.map((action) => (
                      <div key={action.id} className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold tracking-wider text-indigo-600 uppercase dark:bg-indigo-900/30">
                              {action.actionType.replace("_", " ")}
                            </span>
                            <h4 className="mt-1 font-semibold text-gray-900 dark:text-white">Event ID: {action.eventId}</h4>
                          </div>
                          <button onClick={() => handleRemove(action.id)} className="text-gray-400 transition-colors hover:text-rose-500">
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
            <div className="border-t border-gray-100 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-400">Actions will automatically sync when a stable connection is detected.</p>
              </div>
              <button 
                onClick={handleSyncNow}
                disabled={pendingActions.length === 0 || isSyncing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg transition-all hover:bg-indigo-700 disabled:opacity-50"
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
