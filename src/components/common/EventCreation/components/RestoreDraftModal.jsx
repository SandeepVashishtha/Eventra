import { motion, AnimatePresence } from "framer-motion";

export default function RestoreDraftModal({ isOpen, onRestore, onDiscard, message }) {
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
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              Restore Draft?
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {message || "A previously saved event draft was found. Would you like to restore it?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDiscard}
                className="rounded-xl border border-gray-300 px-4 py-2 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                aria-label="button"
              >
                Discard
              </button>
              <button
                onClick={onRestore}
                className="rounded-xl bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
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
