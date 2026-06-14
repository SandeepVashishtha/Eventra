
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, History, Trash2, ArrowRight } from "lucide-react";

const DraftRestoreModal = ({ show, onRestore, onDiscard }) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Unfinished Draft Found</h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                It looks like you were in the middle of creating an event. Would you like to restore your progress or start fresh?
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={onRestore}
                  className="flex items-center justify-between p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5" />
                    <span className="font-semibold">Restore Draft</span>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={onDiscard}
                  className="flex items-center gap-3 p-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">Discard and Start Fresh</span>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>Restoring will overwrite any current changes.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DraftRestoreModal;
