
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, History, Trash2, ArrowRight } from "lucide-react";

const DraftRestoreModal = ({ show, onRestore, onDiscard }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
          >
            <div className="space-y-4 p-6">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Unfinished Draft Found</h3>
              </div>
              
              <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                It looks like you were in the middle of creating an event. Would you like to restore your progress or start fresh?
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={onRestore}
                  className="group flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white transition-all hover:bg-indigo-700"
                >
                  <div className="flex items-center gap-3">
                    <History className="h-5 w-5" />
                    <span className="font-semibold">Restore Draft</span>
                  </div>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button
                  onClick={onDiscard}
                  className="flex items-center gap-3 rounded-xl bg-gray-100 p-4 text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Discard and Start Fresh</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800/50">
              <AlertCircle className="h-4 w-4" />
              <span>Restoring will overwrite any current changes.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DraftRestoreModal;
