import { motion, AnimatePresence } from "framer-motion";

export default function RestoreDraftModal({ isOpen, onRestore, onDiscard }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Restore Draft?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              A previously saved event draft was found. Would you like to restore it?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDiscard}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="button"
              >
                Discard
              </button>
              <button
                onClick={onRestore}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                aria-label="button"
              >
                Restore Draft
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
