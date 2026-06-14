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
            className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-white dark:from-gray-800 dark:to-gray-900">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Event Templates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Download size={48} strokeWidth={1} />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    No templates saved yet
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
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
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Created {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLoadClick(template.id)}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                          aria-label={`Load ${template.name} template`}
                        >
                          <Download size={16} />
                          Load
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDelete(template.id)}
                          className="px-4 py-2 rounded-lg border border-red-300 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium transition-colors flex items-center gap-2"
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
            <div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
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
