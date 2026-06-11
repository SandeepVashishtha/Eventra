import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download } from "lucide-react";

/**
 * TemplatePicker Component
 *
 * Modal for browsing, loading, and deleting saved event templates.
 * Displays all available templates with action buttons.
 */
export default function TemplatePicker({
  isOpen,
  templates,
  onLoad,
  onDelete,
  onClose,
}) {
  if (!isOpen) return null;

  const handleLoadClick = (templateId) => {
    onLoad(templateId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white px-8 py-6 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Event Templates
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {templates.length === 0
                  ? "No templates saved yet"
                  : `${templates.length} template${templates.length !== 1 ? "s" : ""} available`}
              </p>
            </div>

            {/* Templates List */}
            <div className="flex-1 overflow-y-auto p-6">
              {templates.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="mb-4 text-gray-400 dark:text-gray-500">
                    <Download size={48} strokeWidth={1} />
                  </div>
                  <p className="font-medium text-gray-600 dark:text-gray-400">
                    No templates saved yet
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    Create and save templates to reuse event configurations
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLoadClick(template.id)}
                          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                          aria-label={`Load ${template.name} template`}
                        >
                          <Download size={16} />
                          Load
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(template.id)}
                          className="flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          aria-label={`Delete ${template.name} template`}
                        >
                          <Trash2 size={16} />
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-8 py-4 dark:border-gray-700 dark:bg-gray-800">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label="Close template picker"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
